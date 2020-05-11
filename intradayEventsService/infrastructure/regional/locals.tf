locals {
  # For resources in the regional namespace, eg. Lambda, SQS
  resourcePrefix = "${var.projectPrefix}-${var.environment}-intradayEvents"

  # For resources in the global namespace that a regional resource depends on
  # Eg. IAM role for Lambda
  globalResourcePrefix = "${var.projectPrefix}-${var.environment}-${var.region}-intradayEvents"
}
