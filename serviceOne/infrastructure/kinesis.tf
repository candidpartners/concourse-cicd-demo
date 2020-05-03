resource "aws_kinesis_stream" "transaction_stream" {
  name             = "${var.environment}-serviceOne-transaction-stream"
  shard_count      = 1
  retention_period = 24

  tags = {
    Environment = "${var.environment}"
  }
}
