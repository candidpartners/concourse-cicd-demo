output "ingest_bucket" {
  value = aws_s3_bucket.ingest.id
  description = "The name of the ingest bucket"
}

output "ingest_lambda_function" {
  value       = aws_lambda_function.ingest.function_name
  description = "The ingest lambda function name"
}

output "write_lambda_function" {
  value       = aws_lambda_function.write.function_name
  description = "The write lambda function name"
}

output "write_lambda_queue" {
  value       = aws_sqs_queue.writeLambda.id
  description = "The write lambda function url"
}


output "position_table" {
  value       = aws_dynamodb_table.position.name
  description = "The position dynamo table"
}
