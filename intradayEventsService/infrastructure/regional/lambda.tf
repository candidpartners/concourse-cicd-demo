# resource "aws_lambda_permission" "transactionReceiver_lb" {
#   statement_id  = "AllowExecutionFromlb"
#   action        = "lambda:InvokeFunction"
#   function_name = "${aws_lambda_function.transactionReceiver.arn}"
#   principal     = "elasticloadbalancing.amazonaws.com"
#   source_arn    = "${aws_lb_target_group.transactionReceiver.arn}"
# }

resource "aws_lambda_function" "transactionReceiver" {
  function_name = "${local.resourcePrefix}-transactionReceiver"
  filename      = "blank.zip"
  role          = aws_iam_role.eventBuilder.arn
  handler       = "index.handler"
  runtime       = "nodejs12.x"
  memory_size   = 512
  timeout       = 30
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
  event_source_arn = aws_sqs_queue.transactionReceiver.arn
  function_name    = aws_lambda_function.transactionReceiver.arn
  batch_size       = 1
}
