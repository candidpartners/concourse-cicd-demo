const AWS = require('aws-sdk')
const { v4: uuid } = require('uuid')
const Path = require('path')
const utils = require('../utils')
const infrastructure = require('../../../../tfoutput/output.json')

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
    const streamName = Path.basename(infrastructure.kinesis_stream.value)
    const kinesisParams = {
      Data: key,
      PartitionKey: 'partition_key' /* required */,
      StreamName: streamName,
    }
    await kinesis.putRecord(kinesisParams).promise()

    const dbParams = {
      TableName: infrastructure.dynamo_table.value,
      KeyConditionExpression: '#ID = :id',
      ExpressionAttributeNames: {
        '#ID': 'Id',
      },
      ExpressionAttributeValues: {
        ':id': key,
      },
    }

    for (var i = 0; i < 6; i++) {
      await utils.sleep(5000)
      const res = await docClient.query(dbParams).promise()

      if (res) {
        expect(res.Items[0].Id).toEqual(key)
        return
      }
    }

    throw new Error('Record did not appear in DynamoDB after 30 sec')
  })
})
