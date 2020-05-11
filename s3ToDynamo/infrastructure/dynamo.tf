resource "aws_dynamodb_table" "position" {
  name           = "${local.prefix}-position"
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
