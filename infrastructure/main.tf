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
  name             = "${var.environment}-transaction-stream"
  shard_count      = 1
  retention_period = 24

  tags = {
    Environment = "${var.environment}"
  }
}

resource "aws_dynamodb_table" "transaction" {
  name           = "${var.environment}-transaction-dynamodb-table"
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
