provider "aws" {
  region              = var.region
  allowed_account_ids = var.allowedAccountIds
  assume_role {
    role_arn     = var.roleArn
    session_name = "${local.resourcePrefix}-infrastructure-deploy"
  }
}

provider "aws" {
  alias               = "other"
  region              = var.otherRegion
  allowed_account_ids = var.allowedAccountIds
  assume_role {
    role_arn     = var.roleArn
    session_name = "${local.resourcePrefix}-infrastructure-deploy"
  }
}

# Save state to S3.  These parameters are populated by -backend-config
# args to terraform init in the Makefile
terraform {
  backend "s3" {}
}
