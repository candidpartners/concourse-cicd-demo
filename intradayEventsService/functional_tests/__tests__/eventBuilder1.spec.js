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

async function postToMockIngestQueue(sqs, infra, execution) {
  const {
    mockTransactionIngest1_sqs_queue_url: { value: QueueUrl },
  } = infra
  const params = {
    QueueUrl,
    MessageBody: JSON.stringify(execution),
  }
  await sqs.sendMessage(params).promise()
}

describe('Event Builder PoC 1', () => {
  beforeAll(async () => {
    const params = await utils.getSTSCredentials()

    docClient = new AWS.DynamoDB.DocumentClient(params)
    sqsPrimary = new AWS.SQS({ ...params, region: settings.primaryRegion })
    sqsSecondary = new AWS.SQS({ ...params, region: settings.secondaryRegion })
  }, 600000)

  afterAll(async () => {
    AWS.config.credentials = null
  })

  it('transactions in different regions are rolled up by order number and price', async function () {
    const account = uuid() // unique to this test run
    const cusip = '02079K107'
    const date = new Date().toISOString().split('T')[0]
    const orderNum = '001'
    const price = 500

    const tran1 = {
      id: uuid(),
      account,
      cusip,
      date,
      orderNum,
      price,
      quantity: 10,
    }
    const tran2 = {
      id: uuid(),
      account,
      cusip,
      date,
      orderNum,
      price,
      quantity: 5,
    }

    // Simulate a failover with one transaction sent to primary region, one to secondary
    await Promise.all([
      postToMockIngestQueue(sqsPrimary, primaryInfra, tran1),
      postToMockIngestQueue(sqsSecondary, secondaryInfra, tran2),
    ])

    // waitForExpect dynamodb to have both transactions summed up properly
    await waitForExpect(
      async () => {
        const params = {
          TableName: DYNAMO_TABLE.TRANSACTIONS,
          ExpressionAttributeNames: {
            '#id': 'id',
            '#sort': 'sort',
          },
          ExpressionAttributeValues: {
            ':id': `${account}_${cusip}`,
            ':sort': `${date}_BUYSELL_${orderNum}_`,
          },
          KeyConditionExpression: '#id = :id and begins_with(#sort, :sort)',
        }
        const result = await docClient.query(params).promise()

        expect(result).toHaveProperty('Items')
        expect(result.Items.length).toEqual(1)
        expect(result.Items[0]).toMatchObject({
          price,
          quantity: 15,
        })
      },
      10000,
      3000,
    )
  })
})
