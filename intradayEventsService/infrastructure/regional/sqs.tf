resource "aws_sqs_queue" "transactionReceiver" {
  name              = "${local.resourcePrefix}-transactionReceiver"
  kms_master_key_id = "alias/aws/sqs"
}

output "transactionReceiver_sqs_queue_url" {
  value = aws_sqs_queue.transactionReceiver.id
}
