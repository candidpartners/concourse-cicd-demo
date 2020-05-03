output "dynamo_table" {
  value       = aws_dynamodb_table.transaction.name
  description = "The output table"
}

output "kinesis_stream" {
  value       = aws_kinesis_stream.transaction_stream.arn
  description = "The input kinesis stream"
}

output "lambda_function" {
  value       = aws_lambda_function.serviceOne.function_name
  description = "The lambda function name"
}
