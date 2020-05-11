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
  EVENTS: globalInfra.events_dynamo_table.value,
}

let docClient
let sqsPrimary
let sqsSecondary
let ssmPrimary
let ssmSecondary

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function postToMockIngestQueue(sqs, infra, execution) {
  const {
    mockTransactionIngest2_sqs_queue_url: { value: QueueUrl },
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

describe('Event Builder PoC 2', () => {
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

  it('order executions in different regions are rolled up to the same event', async function () {
    const account = uuid() // unique to this test run
    const cusip = '02079K107'
    const date = new Date().toISOString().split('T')[0]
    const prices = [500, 1000, 1500] // $5, $10 or $15
    const quantities = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    // 30 batches of 10 transactions. Each batch has a unique orderNum that we'll query for later
    const batches = new Array(30).fill(0).map((_b, batchIndex) => {
      const orderNum = ('000' + (batchIndex + 1)).slice(-3)
      const transactions = new Array(10).fill(0).map((_t) => ({
        tranId: uuid(),
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
    batches.map((batch, batchIndex) => {
      setTimeout(async () => {
        await Promise.all(
          batch.transactions.map((tran) => {
            // send the first half to primary SQS, second half to secondary SQS
            // this simulates ingest consumers eventually failing over to new region/DNS
            if (batchIndex < 15) {
              return postToMockIngestQueue(sqsPrimary, primaryInfra, tran)
            } else {
              return postToMockIngestQueue(sqsSecondary, secondaryInfra, tran)
            }
          }),
        )
      }, batchIndex * 1000)
    })

    await sleep(10000)

    // flip regions
    await updateActiveRegion(ssmSecondary, secondaryInfra, settings.secondaryRegion)
    await updateActiveRegion(ssmPrimary, primaryInfra, settings.secondaryRegion)

    // waitForExpect dynamodb to have 300 transactions summed up properly
    await waitForExpect(
      async () => {
        // expect each batch to be summed up properly by comparing the batch quantity
        // with the quantity in DynamoDB
        await Promise.all(
          batches.map(async (batch) => {
            const params = {
              TableName: DYNAMO_TABLE.EVENTS,
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
      },
      80000,
      5000,
    )

    // const ex1 = {
    //   tranId: uuid(),
    //   account: 1234,
    //   cusip: '02079K107',
    //   date: '2020-05-08',
    //   orderNum: 123,
    //   price: 500,
    //   quantity: 11,
    // }
    // const ex2 = {
    //   tranId: uuid(),
    //   account: 1234,
    //   cusip: '02079K107',
    //   date: '2020-05-08',
    //   orderNum: 123,
    //   price: 500,
    //   quantity: 4,
    // }
    //
    // split the executions. Put 5 in sqsPrimary, 5 in sqsSecondary
    // await Promise.all([
    //   postToMockIngestQueue(sqsSecondary, secondary, ex2),
    //   postToMockIngestQueue(sqsPrimary, primary, ex1),
    // ])

    // const key = uuid()
    // const itemId = uuid()
    // await s3
    //   .putObject({
    //     Bucket: infrastructure.axway_file_transfer_bucket.value,
    //     Key: `${settings.region}/start_of_day_file${key}`, // bucket should use region prefix paths for cross-region replication
    //     Body: itemId, // TODO: records from string or file read stream
    //     // SSE/KMS params as needed
    //   })
    //   .promise()

    // const dbParams = {
    //   TableName: infrastructure.dynamo_table.value,
    //   KeyConditionExpression: '#ID = :id',
    //   ExpressionAttributeNames: {
    //     '#ID': 'Id',
    //   },
    //   ExpressionAttributeValues: {
    //     ':id': key,
    //   },
    // }

    // for (var i = 0; i < 6; i++) {
    //   await utils.sleep(5000)
    //   const res = await docClient.query(dbParams).promise()

    //   if (res) {
    //     expect(res.Items[0].Id).toEqual(itemId)
    //     return
    //   }
    // }

    // throw new Error('Record did not appear in DynamoDB after 30 sec')
  })
})
