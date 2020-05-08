const AWS = require('aws-sdk')
const config = require('./config.json')

const docClient = new AWS.DynamoDB.DocumentClient({
  region: config.region,
})

async function handler(event) {
  console.log(`Got event: ${JSON.stringify(event)}`)
  // event is from the test Transaction SQS queue (eventually Transaction DDB stream)

  /*
  Transaction schema:
  Primary Key: accountId_CUSIP
  Sort Key: CURRENT_DATE_orderNum_price | CURRENT_DATE_uuid
  1234_<ibm cusip> : <isodate>_123_500 : { quantity: 50 }
  1234_<ibm cusip> : <isodate>_123_500 : { quantity: 25 }
  1234_<ibm cusip> : <isodate>_123_500 : { quantity: 20 }
  1234_<ibm cusip> : <isodate>_123_1000 : { quantity: 5 }
  */

  // Query Asset Info table to get the current asset ID for the CUSIP
  // assume assetId is same as CUSIP for now

  /*
  Event schema:
  Primary Key: accountId_assetId
  Sort Key: CURRENT_DATE_eventType_(orderNum_price | eventId) where eventType is BUYSELL or NONBUYSELL
  1234_<assetId> : <isodate>_BUYSELL_123_500 { transactions: [ 3 items ], quantity: 95 }
  1234_<assetId> : <isodate>_BUYSELL_123_1000 { transactions: [ 1 item ], quantity: 5 }
  */

  // Need to perform an optimistic lock (read+write) on ue1 + ue2 that "rolls up" this Transaction under a common event

  // await Promise.all(
  //   event.Records.map(function (record) {
  //     // Kinesis data is base64 encoded so decode here
  //     var payload = Buffer.from(record.kinesis.data, 'base64').toString('ascii')
  //     console.log('Decoded payload:', payload)

  //     const Key = { Id: payload, Sort: `${Date.now()}`, data: payload }
  //     const params = {
  //       TableName: config.dynamo_table.value,
  //       Key,
  //       Item: Key,
  //     }

  //     return docClient.put(params).promise()
  //   }),
  // )

  // return
}

module.exports.handler = handler
