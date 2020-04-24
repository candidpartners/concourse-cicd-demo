// Just requiring a lot of large libraries to show increased cold start time

const AWSXRay = require('aws-xray-sdk')
const AWS = AWSXRay.captureAWS(require('aws-sdk'))

const config = require('./config.json')

async function handler(event) {
  const docClient = new AWS.DynamoDB.DocumentClient({
    region: config.region,
  })

  await Promise.all(
    event.Records.map(function (record) {
      // Kinesis data is base64 encoded so decode here
      var payload = Buffer.from(record.kinesis.data, 'base64').toString('ascii')
      console.log('Decoded payload:', payload)

      const Key = { Id: payload, Sort: `${Date.now()}`, data: payload }
      const params = {
        TableName: config.dynamo_table,
        Key,
        Item: Key,
      }

      return docClient.put(params).promise()
    }),
  )

  return
}

module.exports.handler = handler
