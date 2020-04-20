const AWS = require('aws-sdk')
const sts = new AWS.STS()
const settings = require('../settings.json')

const TRANSACTION_STREAM = 'transaction-stream'
const TRANSACTION_TABLE = 'transaction-dynamodb-table'

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function getSTSCredentials() {
  const assumeResult = await sts
    .assumeRole({
      RoleArn: settings.roleArn,
      RoleSessionName: `${settings.environment}-functional-tests`,
    })
    .promise()

  return {
    accessKeyId: assumeResult.Credentials.AccessKeyId,
    secretAccessKey: assumeResult.Credentials.SecretAccessKey,
    sessionToken: assumeResult.Credentials.SessionToken,
    region: settings.region,
  }
}

function transactionStreamName() {
  return `${settings.environment}-${TRANSACTION_STREAM}`
}

function transactionTableName() {
  return `${settings.environment}-${TRANSACTION_TABLE}`
}

module.exports = {
  sleep,
  getSTSCredentials,

  transactionStreamName,
  transactionTableName,
}
