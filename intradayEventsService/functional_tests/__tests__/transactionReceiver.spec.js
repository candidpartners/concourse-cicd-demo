const AWS = require('aws-sdk')
const { v4: uuid } = require('uuid')
const waitForExpect = require('wait-for-expect')
const utils = require('../utils')
const {
  settings,
  infrastructure: {
    global: globalInfra,
    regional: { primary: primaryInfra, secondary: secondaryInfra },
  },
} = require('../settings.js')

jest.setTimeout(600000)

const DYNAMO_TABLE = {
  TRANSACTIONS: globalInfra.transactions_dynamo_table.value,
}

let docClient
let sqsPrimary
let sqsSecondary
let ssmPrimary
let ssmSecondary
const demoSocket = new WebSocket('ws://localhost:3000?clientId=jest')

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function postToMockIngestQueue(sqs, infra, execution) {
  const {
    transactionReceiver_sqs_queue_url: { value: QueueUrl },
  } = infra
  const params = {
    QueueUrl,
    MessageBody: JSON.stringify(execution),
  }
  await sqs.sendMessage(params).promise()
}

async function updateActiveRegion(ssm, infra, Value) {
  await ssm
    .putParameter({
      Name: infra.activeRegion_param_name.value,
      Value,
      Overwrite: true,
    })
    .promise()
}

function sample(arrayOfValues) {
  return arrayOfValues[(Math.random() * arrayOfValues.length) | 0]
}

describe('Transaction Receiver PoC 2', () => {
  beforeAll(async () => {
    const params = await utils.getSTSCredentials()

    docClient = new AWS.DynamoDB.DocumentClient(params)
    sqsPrimary = new AWS.SQS({ ...params, region: settings.primaryRegion })
    sqsSecondary = new AWS.SQS({ ...params, region: settings.secondaryRegion })
    ssmPrimary = new AWS.SSM({ ...params, region: settings.primaryRegion })
    ssmSecondary = new AWS.SSM({ ...params, region: settings.secondaryRegion })

    // reset activeRegion to primaryRegion in both regions
    await updateActiveRegion(ssmSecondary, secondaryInfra, settings.primaryRegion)
    await updateActiveRegion(ssmPrimary, primaryInfra, settings.primaryRegion)
  }, 600000)

  afterAll(async () => {
    AWS.config.credentials = null
  })

  it('transactions in different regions are rolled up by order number and price', async function () {
    const account = uuid() // unique to this test run
    const cusip = '02079K107'
    const date = new Date().toISOString().split('T')[0]
    const prices = [500, 1000, 1500] // $5, $10 or $15
    const quantities = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    const batchCount = 30
    const transactionsPerBatch = 10

    demoSocket.send(
      JSON.stringify({
        type: 'scenario',
        label: `${batchCount} batches, ${transactionsPerBatch} transactions per batch, ${
          batchCount * transactionsPerBatch
        } total, ${(batchCount * transactionsPerBatch) / 30} TPS`,
      }),
    )
    demoSocket.send(JSON.stringify({ type: 'activeRegion', region: 'us-east-2' }))

    // 30 batches of 10 transactions. Each batch has a unique orderNum that we'll query for later
    const batches = new Array(batchCount).fill(0).map((_b, batchIndex) => {
      const orderNum = ('000' + (batchIndex + 1)).slice(-3)
      const transactions = new Array(transactionsPerBatch).fill(0).map((_t) => ({
        id: uuid(),
        account,
        cusip,
        date,
        orderNum,
        // pick random values
        price: sample(prices),
        quantity: sample(quantities),
      }))
      return {
        orderNum,
        transactions,
        // sum up quantities of each price
        quantity500: transactions.reduce((a, t) => a + (t.price === 500 ? t.quantity : 0), 0),
        quantity1000: transactions.reduce((a, t) => a + (t.price === 1000 ? t.quantity : 0), 0),
        quantity1500: transactions.reduce((a, t) => a + (t.price === 1500 ? t.quantity : 0), 0),
      }
    })

    // start sending each batch every second (for 30 sec)
    const regionSend = {
      'us-east-2': 0,
      'us-east-1': 0,
    }
    batches.map((batch, batchIndex) => {
      setTimeout(async () => {
        await Promise.all(
          batch.transactions.map((tran) => {
            // send 2/3rds to primary SQS and the rest to secondary SQS
            // this simulates ingest consumers eventually failing over to new region/DNS
            if (batchIndex < 20) {
              regionSend['us-east-2'] += 1
              demoSocket.send(JSON.stringify({ type: 'send', region: 'us-east-2', count: regionSend['us-east-2'] }))
              return postToMockIngestQueue(sqsPrimary, primaryInfra, tran)
            } else {
              regionSend['us-east-1'] += 1
              demoSocket.send(JSON.stringify({ type: 'send', region: 'us-east-1', count: regionSend['us-east-1'] }))
              return postToMockIngestQueue(sqsSecondary, secondaryInfra, tran)
            }
          }),
        )
      }, batchIndex * 1000)
    })

    await sleep(15000)

    // flip regions
    await updateActiveRegion(ssmSecondary, secondaryInfra, settings.secondaryRegion)
    await updateActiveRegion(ssmPrimary, primaryInfra, settings.secondaryRegion)
    demoSocket.send(JSON.stringify({ type: 'activeRegion', region: 'us-east-1' }))

    // waitForExpect dynamodb to have 300 transactions summed up properly
    await waitForExpect(
      async () => {
        // expect each batch to be summed up properly by comparing the batch quantity
        // with the quantity in DynamoDB
        const receiveEvent = {
          'us-east-2': 0,
          'us-east-1': 0,
        }
        const receiveTransaction = {
          'us-east-2': 0,
          'us-east-1': 0,
        }
        let transactionCount = 0
        await Promise.all(
          batches.map(async (batch) => {
            const params = {
              TableName: DYNAMO_TABLE.TRANSACTIONS,
              ExpressionAttributeNames: {
                '#id': 'id',
                '#sort': 'sort',
              },
              ExpressionAttributeValues: {
                ':id': `${account}_${cusip}`,
                ':sort': `${date}_BUYSELL_${batch.orderNum}_`,
              },
              KeyConditionExpression: '#id = :id and begins_with(#sort, :sort)',
            }
            const result = await docClient.query(params).promise()

            expect(result).toHaveProperty('Items')
            expect(result.Items.length).toBeGreaterThan(0)

            result.Items.forEach((i) => {
              receiveEvent[i.region] += 1
              receiveTransaction[i.region] += i.transactions.length
              transactionCount += i.transactions.length
            })
            demoSocket.send(
              JSON.stringify({ type: 'receiveEvent', region: 'us-east-2', count: receiveEvent['us-east-2'] }),
            )
            demoSocket.send(
              JSON.stringify({ type: 'receiveEvent', region: 'us-east-1', count: receiveEvent['us-east-1'] }),
            )
            demoSocket.send(
              JSON.stringify({
                type: 'receiveTransaction',
                region: 'us-east-2',
                count: receiveTransaction['us-east-2'],
              }),
            )
            demoSocket.send(
              JSON.stringify({
                type: 'receiveTransaction',
                region: 'us-east-1',
                count: receiveTransaction['us-east-1'],
              }),
            )

            // If I have a batch quantity for a certain price, I should have a result
            // item with that same quantity
            const expected = [
              ...(batch.quantity500 > 0 ? [expect.objectContaining({ price: 500, quantity: batch.quantity500 })] : []),
              ...(batch.quantity1000 > 0
                ? [expect.objectContaining({ price: 1000, quantity: batch.quantity1000 })]
                : []),
              ...(batch.quantity1500 > 0
                ? [expect.objectContaining({ price: 1500, quantity: batch.quantity1500 })]
                : []),
            ]
            expect(result.Items).toEqual(expect.arrayContaining(expected))
          }),
        )

        expect(transactionCount).toEqual(batchCount * transactionsPerBatch)
      },
      // 120000,
      300000,
      5000,
    )

    // sleep to flush all socket send events
    await sleep(1000)
  })
})
