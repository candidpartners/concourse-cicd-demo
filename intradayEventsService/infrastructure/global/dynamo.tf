resource "aws_dynamodb_table" "transactions" {
  name         = "${local.resourcePrefix}-transactions"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  range_key    = "sort"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "sort"
    type = "S"
  }

  tags = {
    Name        = "${local.resourcePrefix}-transactions"
    Environment = "${var.environment}"
  }

  server_side_encryption {
    enabled = true
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  # TODO: Global Tables V2 not working in Candid Dev Account
  # replica {
  #   region_name = var.drRegion
  # }
}

output "transactions_dynamo_table" {
  value = aws_dynamodb_table.transactions.name
}

resource "aws_dynamodb_table" "transactions_dr" {
  provider     = aws.secondary
  name         = "${local.resourcePrefix}-transactions"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  range_key    = "sort"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "sort"
    type = "S"
  }

  tags = {
    Name        = "${local.resourcePrefix}-transactions"
    Environment = "${var.environment}"
  }

  server_side_encryption {
    enabled = true
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"
}

resource "aws_dynamodb_global_table" "myTable" {
  depends_on = [
    aws_dynamodb_table.transactions,
    aws_dynamodb_table.transactions_dr
  ]

  name = "${local.resourcePrefix}-transactions"

  replica {
    region_name = var.primaryRegion
  }

  replica {
    region_name = var.secondaryRegion
  }
}
