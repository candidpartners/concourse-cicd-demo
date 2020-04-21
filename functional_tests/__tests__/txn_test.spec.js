const AWS = require('aws-sdk')
const { v4: uuid } = require('uuid')
const utils = require('../utils')
const settings = require('../../settings.json')

let kinesis
let docClient

jest.setTimeout(600000)

describe('Kinesis Demo', () => {
  beforeAll(async () => {
    const params = await utils.getSTSCredentials()

    kinesis = new AWS.Kinesis(params)
    docClient = new AWS.DynamoDB.DocumentClient(params)
  }, 600000)

  afterAll(async () => {
    AWS.config.credentials = null
  })

  it('Can write an item to the dynamo table', async function () {
    const key = uuid()
    const kinesisParams = {
      Data: key,
      PartitionKey: 'partition_key' /* required */,
      StreamName: utils.transactionStreamName(),
    }
    await kinesis.putRecord(kinesisParams).promise()

    const dbParams = {
      TableName: utils.transactionTableName(),
      KeyConditionExpression: '#ID = :id',
      ExpressionAttributeNames: {
        '#ID': 'Id',
      },
      ExpressionAttributeValues: {
        ':id': key,
      },
    }
    await utils.sleep(5000)
    const res = await docClient.query(dbParams).promise()
    console.log(res)

    expect(res.Items[0].Id).toEqual(key)
  })
})
