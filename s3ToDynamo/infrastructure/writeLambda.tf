resource "aws_sqs_queue" "writeLambda" {
  name = "${local.prefix}-writeLambda"

  kms_master_key_id                 = var.kmsKey
  kms_data_key_reuse_period_seconds = 300
}

resource "aws_lambda_function" "write" {
  function_name = "${local.prefix}-write"
  filename      = "blank.zip"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "index.handler"
  runtime       = "nodejs12.x"
}

resource "aws_lambda_event_source_mapping" "example" {
  event_source_arn = aws_sqs_queue.writeLambda.arn
  function_name    = aws_lambda_function.write.arn
}
