provider "aws" {
  region = "${var.region}"
}

resource "aws_kinesis_stream" "transaction_stream" {
  name             = "transaction-stream"
  shard_count      = 1
  retention_period = 24

  tags = {
    Environment = "dev"
  }
}

resource "aws_dynamodb_table" "transaction" {
  name           = "transaction-dynamodb-table"
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
    Environment = "dev"
  }

  stream_enabled = true
  stream_view_type = "KEYS_ONLY"
}
