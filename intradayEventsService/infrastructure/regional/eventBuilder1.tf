resource "aws_sqs_queue" "mockTransactionIngest1" {
  name              = "${local.resourcePrefix}-mockTransactionIngest1"
  kms_master_key_id = "alias/aws/sqs"
}

output "mockTransactionIngest1_sqs_queue_url" {
  value = aws_sqs_queue.mockTransactionIngest1.id
}

resource "aws_lambda_function" "eventBuilder1" {
  function_name = "${local.resourcePrefix}-eventBuilder1"
  filename      = "blank.zip"
  role          = aws_iam_role.eventBuilder.arn
  handler       = "index.handler"
  runtime       = "nodejs12.x"
}

output "eventBuilder1_lambda_function" {
  value = aws_lambda_function.eventBuilder1.function_name
}

resource "aws_cloudwatch_log_group" "eventBuilder1" {
  name              = "/aws/lambda/${aws_lambda_function.eventBuilder1.function_name}"
  retention_in_days = var.logRetentionInDays
}

resource "aws_lambda_permission" "eventBuilder1_sqs" {
  function_name = aws_lambda_function.eventBuilder1.function_name
  action        = "lambda:InvokeFunction"
  principal     = "sqs.amazonaws.com"
}

resource "aws_lambda_event_source_mapping" "eventBuilder1_sqs" {
  event_source_arn = aws_sqs_queue.mockTransactionIngest1.arn
  function_name    = aws_lambda_function.eventBuilder1.arn
  batch_size       = 1
}
