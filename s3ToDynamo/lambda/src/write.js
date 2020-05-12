const AWS = require('aws-sdk')
const config = require('./config.json')

const dynamo = new AWS.DynamoDB.DocumentClient({
  region: config.region,
})

async function processMessage(record) {
  // Payload format:
  // {
  //   id: uuid,
  //   timestamp: number,
  //   recordType: string,
  //   values: []
  // }
  const payload = JSON.parse(record.body)

  // Write to DynamoDB
  const params = {
    TableName: config.position_table.value,
    Item: payload,
  }
  console.log(params)
  return dynamo.put(params).promise()
}

async function handler(event) {
  // processRecord called for each record in the event.  Wait for all records to be processed.
  await Promise.all(event.Records.map(processMessage))
}

module.exports.handler = handler
