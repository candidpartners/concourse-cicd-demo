provider "aws" {
  region = "${var.region}"
  allowed_account_ids = "${var.allowedAccountIds}"
  assume_role {
    role_arn     = "${var.roleArn}"
    session_name = "${var.environment}-infrastructure-deploy"
  }
}

# Save state to S3.  These parameters are populated by -backend-config
# args to terraform init in the Makefile
terraform {
  backend "s3" {}
}

resource "aws_kinesis_stream" "transaction_stream" {
  name             = "${var.environment}-serviceOne-transaction-stream"
  shard_count      = 1
  retention_period = 24

  tags = {
    Environment = "${var.environment}"
  }
}

resource "aws_dynamodb_table" "transaction" {
  name           = "${var.environment}-serviceOne-transaction-dynamodb-table"
  billing_mode   = "PROVISIONED"
  read_capacity  = 100
  write_capacity = 100
  hash_key       = "Id"
  range_key      = "Sort"

  attribute {
    name = "Id"
    type = "S"
  }

  attribute {
    name = "Sort"
    type = "S"
  }

  tags = {
    Name        = "transaction-table"
    Environment = "${var.environment}"
  }

  stream_enabled = true
  stream_view_type = "KEYS_ONLY"
}

resource "aws_iam_role" "iam_for_lambda" {
  name = "${var.environment}-serviceOne-lambda-role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Effect": "Allow"
    },
    {
      "Action": [
        "kinesis:*"
      ],
      "Effect": "Allow"
    },
    {
      "Action": [
        "dynamodb:PutItem"
      ],
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_lambda_function" "serviceOne" {
  function_name = "${var.environment}-serviceOne"
  filename      = "blank.zip"
  role          = "${aws_iam_role.iam_for_lambda.arn}"
  handler       = "exmprts.handler"
  runtime       = "nodejs12.x"
}

resource "aws_lambda_event_source_mapping" "serviceOne-lambda-trigger" {
  event_source_arn  = "${aws_kinesis_stream.transaction_stream.arn}"
  function_name     = "${aws_lambda_function.serviceOne.arn}"
  starting_position = "LATEST"
}
