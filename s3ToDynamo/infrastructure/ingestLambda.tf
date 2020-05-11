# Ingest lambda that is triggered when file is added to s3 bucket
resource "aws_lambda_function" "ingest" {
  function_name = "${local.prefix}-ingest"
  filename      = "blank.zip"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "index.handler"
  runtime       = "nodejs12.x"
}


resource "aws_lambda_permission" "allow_exec_from_s3" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ingest.arn
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.ingest.arn
}
