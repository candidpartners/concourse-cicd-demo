resource "aws_dynamodb_table" "events" {
  # provider       = aws.dr # us-east-1
  name           = "${local.resourcePrefix}-events"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"
  range_key      = "sort"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "sort"
    type = "S"
  }

  tags = {
    Name        = "${local.resourcePrefix}-events"
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

output "events_dynamo_table" {
  value = aws_dynamodb_table.events.name
}

resource "aws_dynamodb_table" "events_dr" {
  provider       = aws.dr
  name           = "${local.resourcePrefix}-events"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"
  range_key      = "sort"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "sort"
    type = "S"
  }

  tags = {
    Name        = "${local.resourcePrefix}-events"
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
    aws_dynamodb_table.events,
    aws_dynamodb_table.events_dr
  ]

  name = "${local.resourcePrefix}-events"

  replica {
    region_name = var.region
  }

  replica {
    region_name = var.drRegion
  }
}
