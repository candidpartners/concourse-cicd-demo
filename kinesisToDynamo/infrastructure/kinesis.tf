resource "aws_kinesis_stream" "transaction" {
  name             = "${local.prefix}-transaction"
  shard_count      = 1
  retention_period = 24

  tags = {
    Environment = var.environment
  }
}
