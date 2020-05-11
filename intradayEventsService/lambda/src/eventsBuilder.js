/**
 * Receives messages from transactions SQS and aggregates them into Events table
 * under the same order and price.
 */
const AWS = require('aws-sdk')
const config = require('./config.json')

const { AWS_REGION: currentRegion } = process.env

const DYNAMO_TABLE = {
  EVENTS: config.global.events_dynamo_table.value,
}

const docClient = new AWS.DynamoDB.DocumentClient()

async function handler(event) {
  console.log(`Got event: ${JSON.stringify(event)}`)

  // event is from the test Transaction SQS queue (eventually Transaction DDB stream)
  const bodyString = event.Records[0].body
  const tran = JSON.parse(bodyString)
  /*
  Transaction schema:
  Primary Key: accountId_CUSIP
  Sort Key: CURRENT_DATE_orderNum_price | CURRENT_DATE_uuid
  {
    tranId: <uuid>,
    account: 1234,
    cusip: <ibm cusip>,
    date: <isodate>,
    orderNum: 123,
    price: 500,
    quantity: 50,
  }
  1234_<ibm cusip> : <isodate>_123_500 : { quantity: 50 }
  1234_<ibm cusip> : <isodate>_123_500 : { quantity: 25 }
  1234_<ibm cusip> : <isodate>_123_500 : { quantity: 20 }
  1234_<ibm cusip> : <isodate>_123_1000 : { quantity: 5 }
  */

  // Query Asset Info table to get the current asset ID for the CUSIP
  // For now we assume assetId is same as CUSIP

  /*
  Event schema:
  Primary Key: accountId_assetId
  Sort Key: CURRENT_DATE_eventType_(orderNum_price | eventId) where eventType is BUYSELL or NONBUYSELL
  1234_<assetId> : <isodate>_BUYSELL_123_500 { transactions: [ 3 items ], quantity: 95 }
  1234_<assetId> : <isodate>_BUYSELL_123_1000 { transactions: [ 1 item ], quantity: 5 }
  */

  const params = {
    TableName: DYNAMO_TABLE.EVENTS,
    Key: {
      id: `${tran.account}_${tran.cusip}`,
      sort: `${tran.date}_BUYSELL_${tran.orderNum}_${tran.price}`,
    },
    ExpressionAttributeNames: {
      '#transactions': 'transactions',
      '#quantity': 'quantity',
      '#region': 'region',
      '#price': 'price',
    },
    ExpressionAttributeValues: {
      ':newChild': [tran],
      ':emptyChild': [],
      ':quantity': tran.quantity,
      ':region': currentRegion,
      ':price': tran.price,
    },
    UpdateExpression: `SET #transactions = list_append(if_not_exists(#transactions, :emptyChild), :newChild), #region = :region, #price = :price
      ADD #quantity :quantity
      `,
  }

  // const params = {
  //   TableName: DYNAMO_TABLE.EVENTS,
  //   Key: {
  //     id: `${tran.account}_${tran.cusip}`,
  //     sort: `${tran.date}_${tran.orderNum}_${tran.price}`,
  //   },
  //   ExpressionAttributeNames: {
  //     '#transactions': 'transactions',
  //     '#tranId': tran.tranId,
  //     // '#quantity': 'quantity',
  //   },
  //   ExpressionAttributeValues: {
  //     ':transaction': tran,
  //     // ':emptyMap': {},
  //     // ':quantity': tran.quantity,
  //   },
  //   UpdateExpression: 'SET #transactions.#tranId = :transaction',
  // }

  const startTime = process.hrtime()

  await docClient.update(params).promise()

  const endTime = process.hrtime(startTime)
  const uploadTime = `${endTime[0]}s ${endTime[1] / 1000000}ms`
  console.log(`Dynamo update completed. Time elapsed: ${uploadTime}`)
}

module.exports.handler = handler
