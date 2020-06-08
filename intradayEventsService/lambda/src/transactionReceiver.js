/**
 * Receives messages from mockTransactionIngest SQS (as a mock to ALB) and sends
 * to transactions SQS. Honors active region setting from SSM.
 */
const AWS = require('aws-sdk')
const config = require('./config.json')

const { AWS_REGION: currentRegion } = process.env
const regionalConfig = currentRegion === config.primaryRegion ? config.primary : config.secondary
const otherConfig = currentRegion === config.primaryRegion ? config.secondary : config.primary

const DYNAMO_TABLE = {
  TRANSACTIONS: config.global.transactions_dynamo_table.value,
}

const sqs = new AWS.SQS()
const ssm = new AWS.SSM()
const docClient = new AWS.DynamoDB.DocumentClient()

async function sendToQueue({ queueUrl, message, delaySeconds = undefined }) {
  const params = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(message),
  }

  delaySeconds && (params.DelaySeconds = delaySeconds)

  await sqs.sendMessage(params).promise()
}

async function getActiveRegion() {
  const {
    Parameter: { Value: activeRegion },
  } = await ssm
    .getParameter({
      Name: regionalConfig.activeRegion_param_name.value,
    })
    .promise()
  return activeRegion
}

/**
 * Checks if our current region is the active region (per SSM) and enqueues message in
 * other region if we're not.
 * @return false if we're not in the active region
 */
async function ensureActiveRegion(message) {
  // Check for active region
  const activeRegion = await getActiveRegion()
  console.log(`activeRegion is ${activeRegion}`)

  if (currentRegion !== activeRegion) {
    console.log(
      `activeRegion (${activeRegion}) is different than currentRegion (${currentRegion}). Enqueuing in other region SQS and exiting.`,
    )
    await sendToQueue({
      queueUrl: otherConfig.transactionReceiver_sqs_queue_url.value,
      message,
      delaySeconds: 15,
    })
    console.log(`Send to other SQS completed`)

    return false
  }

  return true
}

async function handler(event) {
  console.log(`Got event: ${JSON.stringify(event)}`)

  const bodyString = event.Records[0].body
  const tran = JSON.parse(bodyString)

  if (!tran.receiveTime) {
    tran.receiveTime = new Date().toISOString()
    tran.receiveRegion = currentRegion
  }

  // If active region is different from current region, enqueue in other region and exit
  if (!(await ensureActiveRegion(tran))) {
    console.log('SHOULD BE EXITING')
    return
  }

  tran.writeRegion = currentRegion

  // Otherwise perform the roll-up in DynamoDB

  /*
  Transaction execution schema:
  Primary Key: accountId_CUSIP
  Sort Key: CURRENT_DATE_orderNum_price | CURRENT_DATE_uuid
  {
    id: <uuid>,
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
  Transaction roll-up schema:
  Primary Key: accountId_assetId
  Sort Key: CURRENT_DATE_eventType_(orderNum_price | eventId) where eventType is BUYSELL or NONBUYSELL
  1234_<assetId> : <isodate>_BUYSELL_123_500 { transactions: [ 3 items ], quantity: 95 }
  1234_<assetId> : <isodate>_BUYSELL_123_1000 { transactions: [ 1 item ], quantity: 5 }
  */

  const params = {
    TableName: DYNAMO_TABLE.TRANSACTIONS,
    Key: {
      id: `${tran.account}_${tran.cusip}`,
      sort: `${tran.date}_BUYSELL_${tran.orderNum}_${tran.price}`,
    },
    ExpressionAttributeNames: {
      '#transactions': 'transactions',
      '#quantity': 'quantity',
      '#region': 'region',
      '#price': 'price',
      '#data': 'data',
    },
    ExpressionAttributeValues: {
      ':newChild': [tran],
      ':emptyChild': [],
      ':quantity': tran.quantity,
      ':region': currentRegion,
      ':price': tran.price,
      ':data': {},
    },
    UpdateExpression: `SET #transactions = list_append(if_not_exists(#transactions, :emptyChild), :newChild), #region = :region, #price = :price, #data = :data
      ADD #quantity :quantity
      `,
  }

  console.log(`Rolling up into Event key: ${JSON.stringify(params.Key)}`)

  const startTime = process.hrtime()

  await docClient.update(params).promise()

  const endTime = process.hrtime(startTime)
  const uploadTime = `${endTime[0]}s ${endTime[1] / 1000000}ms`
  console.log(`Dynamo update completed. Time elapsed: ${uploadTime}`)
}

module.exports.handler = handler
