resource "aws_lambda_function" "ingest" {
  function_name = "${local.prefix}-ingest"
  filename      = "blank.zip"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "index.handler"
  runtime       = "nodejs12.x"
}

resource "aws_lambda_event_source_mapping" "ingest-trigger" {
  event_source_arn  = aws_kinesis_stream.transaction.arn
  function_name     = aws_lambda_function.ingest.arn
  starting_position = "LATEST"
}
