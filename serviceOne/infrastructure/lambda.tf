resource "aws_lambda_function" "serviceOne" {
  function_name = "${var.environment}-serviceOne"
  filename      = "blank.zip"
  role          = "${aws_iam_role.iam_for_lambda.arn}"
  handler       = "index.handler"
  runtime       = "nodejs12.x"
}

resource "aws_lambda_event_source_mapping" "serviceOne-lambda-trigger" {
  event_source_arn  = "${aws_kinesis_stream.transaction_stream.arn}"
  function_name     = "${aws_lambda_function.serviceOne.arn}"
  starting_position = "LATEST"
}
