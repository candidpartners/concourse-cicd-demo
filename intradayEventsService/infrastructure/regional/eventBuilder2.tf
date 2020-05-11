resource "aws_ssm_parameter" "activeRegion" {
  name  = "${local.resourcePrefix}-activeRegion"
  type  = "String"
  value = var.primaryRegion

  lifecycle {
    ignore_changes = [
      value
    ]
  }
}

output "activeRegion_param_name" {
  value = aws_ssm_parameter.activeRegion.name
}

resource "aws_sqs_queue" "mockTransactionIngest2" {
  name              = "${local.resourcePrefix}-mockTransactionIngest2"
  kms_master_key_id = "alias/aws/sqs"
}

output "mockTransactionIngest2_sqs_queue_url" {
  value = aws_sqs_queue.mockTransactionIngest2.id
}

resource "aws_lambda_function" "transactionReceiver" {
  function_name = "${local.resourcePrefix}-transactionReceiver"
  filename      = "blank.zip"
  role          = aws_iam_role.eventBuilder.arn
  handler       = "index.handler"
  runtime       = "nodejs12.x"
}

output "transactionReceiver_lambda_function" {
  value = aws_lambda_function.transactionReceiver.function_name
}

resource "aws_cloudwatch_log_group" "transactionReceiver" {
  name              = "/aws/lambda/${aws_lambda_function.transactionReceiver.function_name}"
  retention_in_days = var.logRetentionInDays
}

resource "aws_lambda_permission" "transactionReceiver_sqs" {
  function_name = aws_lambda_function.transactionReceiver.function_name
  action        = "lambda:InvokeFunction"
  principal     = "sqs.amazonaws.com"
}

resource "aws_lambda_event_source_mapping" "transactionReceiver_sqs" {
  event_source_arn = aws_sqs_queue.mockTransactionIngest2.arn
  function_name    = aws_lambda_function.transactionReceiver.arn
  batch_size       = 1
}

resource "aws_sqs_queue" "transactions" {
  name              = "${local.resourcePrefix}-transactions"
  kms_master_key_id = "alias/aws/sqs"
}

output "transactions_sqs_queue_url" {
  value = aws_sqs_queue.transactions.id
}

resource "aws_lambda_function" "eventBuilder2" {
  function_name = "${local.resourcePrefix}-eventBuilder2"
  filename      = "blank.zip"
  role          = aws_iam_role.eventBuilder.arn
  handler       = "index.handler"
  runtime       = "nodejs12.x"
}

output "eventBuilder2_lambda_function" {
  value = aws_lambda_function.eventBuilder2.function_name
}

resource "aws_cloudwatch_log_group" "eventBuilder2" {
  name              = "/aws/lambda/${aws_lambda_function.eventBuilder2.function_name}"
  retention_in_days = var.logRetentionInDays
}

resource "aws_lambda_permission" "eventBuilder2_sqs" {
  function_name = aws_lambda_function.eventBuilder2.function_name
  action        = "lambda:InvokeFunction"
  principal     = "sqs.amazonaws.com"
}

resource "aws_lambda_event_source_mapping" "eventBuilder2_sqs" {
  event_source_arn = aws_sqs_queue.transactions.arn
  function_name    = aws_lambda_function.eventBuilder2.arn
  batch_size       = 1
}
