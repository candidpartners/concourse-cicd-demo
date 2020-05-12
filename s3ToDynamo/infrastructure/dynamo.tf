resource "aws_dynamodb_table" "position" {
  name           = "${local.prefix}-position"
  billing_mode   = "PROVISIONED"
  read_capacity  = 100
  write_capacity = 100
  hash_key       = "id"
  range_key      = "timestamp"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  tags = {
    Name        = "position-table"
    Environment = "${var.environment}"
  }

  stream_enabled = true
  stream_view_type = "KEYS_ONLY"
}
