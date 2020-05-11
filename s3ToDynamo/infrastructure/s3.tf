resource "aws_s3_bucket" "ingest" {
  bucket = "${local.prefix}-ingest"
  acl    = "private"

  tags = {
    Name        = "${local.prefix}-ingest"
    Environment = "${var.environment}"
  }
}

# Allow lambda to read, list, and delete.  Allow deploy role full access
resource "aws_s3_bucket_policy" "ingest-bucket-policy" {
  bucket = aws_s3_bucket.ingest.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "${aws_iam_role.lambda_execution.arn}"
      },
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "${aws_s3_bucket.ingest.arn}"
    },
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "${aws_iam_role.lambda_execution.arn}"
      },
      "Action": [
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "${aws_s3_bucket.ingest.arn}/*"
    }
  ]
}
EOF
}

# Trigger ingest lambda when new file is added to bucket
resource "aws_s3_bucket_notification" "s3-lambda-trigger" {
  bucket = aws_s3_bucket.ingest.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.ingest.arn
    events              = ["s3:ObjectCreated:*"]
  }

  depends_on = [aws_lambda_permission.allow_exec_from_s3]
}
