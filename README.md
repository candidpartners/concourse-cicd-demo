# concourse-cicd-demo

Buildout for Concourse CICD demo.

Terraform for Kinesis and Dynamo infrastructure.
Lambda function deployed via serverless framework.
Simple functional test.

## Setup
1. Install `docker`.
2. `brew cask install fly`
3. `cd ci; docker-compose up -d`
4. `fly --target demo login --concourse-url http://127.0.0.1:8080 -u test -p test`
5. Create a file called params.yml:
    ```
	environment: (environment name)
    aws_region: us-east-2
    aws_access_key_id: (access key)
    aws_secret_access_key: (secret key)
    ```
6. Set up pipeline: `fly -t demo set-pipeline -c pipeline.yml -p demo-pipeline -l params.yml`
7. Trigger job from command line `fly -t demo trigger-job -j demo-pipeline/deploy -w`
