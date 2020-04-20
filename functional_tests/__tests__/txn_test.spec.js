const AWS = require('aws-sdk')
const uuid = require('uuid/v4')
const sts = new AWS.STS()

let kinesis
let docClient

jest.setTimeout(600000)

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}  

describe('Kinesis Demo', () => {

  beforeAll(async () => {
    console.log('Starting...')
    const assumeResult = await sts
      .assumeRole({
        RoleArn: "arn:aws:iam::619481458632:role/deploy-role",
        RoleSessionName: 'test-demo',
      })
      .promise()

    const params = {
      accessKeyId: assumeResult.Credentials.AccessKeyId,
      secretAccessKey: assumeResult.Credentials.SecretAccessKey,
      sessionToken: assumeResult.Credentials.SessionToken,
      region: 'us-east-1',
    }
console.log(params)
    kinesis = new AWS.Kinesis(params);

    docClient = new AWS.DynamoDB.DocumentClient(params)

  }, 600000)

  afterAll(async function() {
    AWS.config.credentials = null
  })

  it('Can write an item to the dynamo table', async function() {
    const key = uuid()
    const kinesisParams = {
      Data: key,
      PartitionKey: "partition_key", /* required */
      StreamName: 'transaction-stream', /* required */
    };
    await kinesis.putRecord(kinesisParams).promise()

    const dbParams = {
      TableName: "transaction-dynamodb-table",
      KeyConditionExpression:
        '#ID = :id',
      ExpressionAttributeNames: {
          '#ID': 'Id'
      },
      ExpressionAttributeValues: {
          ':id': key
      }
    }
    await sleep(5000);
    const res = await docClient.query(dbParams).promise()
    console.log(res)

    expect(res.Items[0].Id).toEqual(key)
  
  })
})
