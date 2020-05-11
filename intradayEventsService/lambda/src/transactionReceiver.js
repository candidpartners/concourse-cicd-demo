/**
 * Receives messages from mockTransactionIngest SQS (as a mock to ALB) and sends
 * to transactions SQS. Honors active region setting from SSM.
 */
const AWS = require('aws-sdk')
const config = require('./config.json')

const { AWS_REGION: currentRegion } = process.env
const regionalConfig = currentRegion === config.primaryRegion ? config.primary : config.secondary
const otherConfig = currentRegion === config.primaryRegion ? config.secondary : config.primary

const sqs = new AWS.SQS()
const ssm = new AWS.SSM()

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

async function handler(event) {
  console.log(`Got event: ${JSON.stringify(event)}`)

  // event is from the test Transaction SQS queue (eventually Transaction DDB stream)
  const bodyString = event.Records[0].body
  const tran = JSON.parse(bodyString)

  // Check for active region
  const activeRegion = await getActiveRegion()
  console.log(`activeRegion is ${activeRegion}`)

  // If active region is different from current region, enqueue in other region and exit
  if (currentRegion !== activeRegion) {
    console.log(
      `activeRegion (${activeRegion}) is different than currentRegion (${currentRegion}). Enqueuing in other region SQS and exiting.`,
    )
    await sendToQueue({
      queueUrl: otherConfig.transactions_sqs_queue_url.value,
      message: tran,
      delaySeconds: 30,
    })
    console.log(`Send to other SQS completed`)

    return
  }

  // Otherwise send to current region's SQS
  await sendToQueue({
    queueUrl: regionalConfig.transactions_sqs_queue_url.value,
    message: tran,
  })
  console.log(`Send to SQS completed`)
}

module.exports.handler = handler
