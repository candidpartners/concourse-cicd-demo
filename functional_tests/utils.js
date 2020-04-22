const AWS = require('aws-sdk')
const sts = new AWS.STS()
const settings = require('../../settings/settings.json')

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

module.exports = {
  sleep,
  getSTSCredentials,
}
