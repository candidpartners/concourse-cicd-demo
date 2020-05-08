resource "aws_sqs_queue" "eventsBuilder" {
  name              = "${local.resourcePrefix}-eventsBuilder"
  kms_master_key_id = "alias/aws/sqs"
}

output "eventsBuilder_sqs_queue_url" {
  value = aws_sqs_queue.eventsBuilder.id
}

resource "aws_lambda_function" "eventsBuilder" {
  function_name = "${local.resourcePrefix}-eventsBuilder"
  filename      = "blank.zip"
  role          = aws_iam_role.eventsBuilder.arn
  handler       = "index.handler"
  runtime       = "nodejs12.x"
}

output "eventsBuilder_lambda_function" {
  value = aws_lambda_function.eventsBuilder.function_name
}

resource "aws_lambda_permission" "eventsBuilder_sqs" {
  function_name = aws_lambda_function.eventsBuilder.function_name
  action        = "lambda:InvokeFunction"
  principal     = "sqs.amazonaws.com"
}

resource "aws_lambda_event_source_mapping" "eventsBuilder_sqs" {
  event_source_arn = aws_sqs_queue.eventsBuilder.arn
  function_name    = aws_lambda_function.eventsBuilder.arn
  batch_size       = 1
}

resource "aws_iam_role" "eventsBuilder" {
  name = "${local.resourcePrefix}-eventsBuilder"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "eventsBuilder_role_policy" {
  role   = aws_iam_role.eventsBuilder.id
  policy = data.aws_iam_policy_document.eventsBuilder_policy.json
}

data "aws_iam_policy_document" "eventsBuilder_policy" {
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = ["arn:aws:logs:*:*:*"]
  }
  statement {
    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:SendMessage",
      "sqs:GetQueueUrl"
    ]
    resources = [aws_sqs_queue.eventsBuilder.arn]
  }
  statement {
    actions = [
      "dynamodb:PutItem",
      "dynamodb:GetItem",
      "dynamodb:UpdateItem",
      "dynamodb:Query",
      "dynamodb:DeleteItem"
    ]
    resources = ["*"]
  }
  statement {
    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey"
    ]
    resources = ["*"]
  }
}
