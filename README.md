# concourse-cicd-demo

Buildout for Concourse CICD demo.

Terraform for Kinesis and Dynamo infrastructure.
Lambda function deployed via serverless framework.
Simple functional test.

## Setup
1. Install dependencies:
    * Install docker
	* `brew cask install fly`
2. Set up concourse (inside the ci directory):
    * Load and run concourse docker images: `docker-compose up -d`
	* Set up credentials for accessing concourse: `fly --target demo login --concourse-url http://127.0.0.1:8080 -u test -p test`.  This will create a `~/.flyrc` file
    * Create a file called params.yml:
        ```
	        environment: (developer specific environment name)
            aws_region: us-east-2
            aws_access_key_id: (access key)
            aws_secret_access_key: (secret key)
        ```
    * Set up pipeline: `fly -t demo set-pipeline -c pipeline.yml -p demo-pipeline -l params.yml`
3. Create a developer-specific config file in the `config` directory.  Use the same developer-specific environment name you used in params.yml:
    ```
        {
          "environment": "(developer specific environment name)"
        }
    ```

You can trigger jobs from command line: `fly -t demo trigger-job -j demo-pipeline/serviceOne -w`.  They will also be triggered automatically if something is committed to the repo
