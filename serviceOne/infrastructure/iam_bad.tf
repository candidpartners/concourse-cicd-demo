# aws-iam-custom-policies-have-controlled-scope
# Custom IAM Policies should not allow specified actions.
resource "aws_iam_policy" "bad-policy1" {
  name        = "bad-policy1"
  path        = "/"
  description = "bad policy"
  policy      = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "iam:CreateUser"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}

# aws-iam-no-passrole-star-policies
# No IAM Roles should allow * in a passrole instance.
resource "aws_iam_policy" "bad-policy2" {
  name        = "bad-policy2"
  path        = "/"
  description = "bad policy"
  policy      = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "iam:PassRole"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}

# aws-iam-no-policies-allow-cloudtrail-stop
# No IAM Policies should allow Cloud Trail to Start / Stop.
resource "aws_iam_policy" "bad-policy3" {
  name        = "bad-policy3"
  path        = "/"
  description = "bad policy"
  policy      = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "cloudtrail:StopLogging", 
        "cloudtrail:DeleteTrail"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}

# aws-iam-policies-are-least-privileged
# All IAM policies should follow a least-privileged model.
data "aws_iam_policy_document" "example-1" {
  statement {
    actions = [
      "*",
      "s3:putObject",
    ]
    resources = [
      "arn:aws:s3:::myBucket/home/fooUser",
    ]
  }
}
data "aws_iam_policy_document" "example-2" {
  statement {
    actions = [
      "s3:putObject",
    ]
    resources = [
      "*",
      "arn:aws:s3:::myBucket/home/fooUser",
    ]
  }
}
resource "aws_iam_policy" "bad-example-1" {
  name   = "example_policy_1"
  path   = "/"
  policy = data.aws_iam_policy_document.example-1.json
}
resource "aws_iam_policy" "bad-example-2" {
  name   = "example_policy_2"
  path   = "/"
  policy = data.aws_iam_policy_document.example-2.json
}

# aws-iam-trust-policy-only-allows-one-service
# Trust policy for a role should only allows 1 service to assume that role
resource "aws_iam_role" "iam_bad_5" {
  name               = "iam_for_lambda"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "*.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}
