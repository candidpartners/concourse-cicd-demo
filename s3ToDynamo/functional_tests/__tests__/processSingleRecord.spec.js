const AWS = require('aws-sdk')
const { v4: uuid } = require('uuid')
const Path = require('path')
const utils = require('../utils')
const { infrastructure } = require('../settings.js')

let s3
let docClient

jest.setTimeout(600000)

describe('S3 to DynamoDB', () => {
  beforeAll(async () => {
    const params = await utils.getSTSCredentials()

    s3 = new AWS.S3(params)
    docClient = new AWS.DynamoDB.DocumentClient(params)
  }, 600000)

  afterAll(async () => {
    AWS.config.credentials = null
  })

  it('Should process a single record', async function () {
    const id = uuid()
    const s3Key = uuid()

    const record = `${id},BUY,1,2,3,4,5`

    const params = {
      Bucket: infrastructure.ingest_bucket.value,
      Key: s3Key,
      ContentType: 'text/csv',
      Body: Buffer.from(record),
    }

    // Create a file in the ingest bucket
    await s3.putObject(params).promise()

    const dbParams = {
      TableName: infrastructure.position_table.value,
      KeyConditionExpression: '#ID = :id',
      ExpressionAttributeNames: {
        '#ID': 'id',
      },
      ExpressionAttributeValues: {
        ':id': id,
      },
    }

    // Wait for the record to show up in dynamo
    for (var i = 0; i < 30; i++) {
      await utils.sleep(5000)
      const res = await docClient.query(dbParams).promise()

      if (res.Items.length > 0) {
        // Found the record.
        const item = res.Items[0]
        expect(item.id).toEqual(id)
        expect(item.timestamp).toBeDefined()
        expect(item.values).toEqual(['1', '2', '3', '4', '5'])

        // TODO test that file is removed from S3
        return
      }
    }

    throw new Error('Record did not appear in DynamoDB.')
  })
})
