resource "aws_lambda_function" "serviceTwo" {
  function_name = "${var.environment}-serviceTwo"
  filename      = "blank.zip"
  role          = aws_iam_role.iam_for_lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs12.x"
}

resource "aws_lambda_event_source_mapping" "serviceTwo-lambda-trigger" {
  event_source_arn  = aws_kinesis_stream.transaction_stream.arn
  function_name     = aws_lambda_function.serviceTwo.arn
  starting_position = "LATEST"
}
