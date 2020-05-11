output "dynamo_table" {
  value       = aws_dynamodb_table.transaction.name
  description = "The output table"
}

output "kinesis_stream" {
  value       = aws_kinesis_stream.transaction.arn
  description = "The input kinesis stream"
}

output "ingest_lambda_function" {
  value       = aws_lambda_function.ingest.function_name
  description = "The ingest lambda function name"
}
