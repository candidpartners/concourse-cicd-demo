resource "aws_ssm_parameter" "activeRegion" {
  name  = "${local.resourcePrefix}-activeRegion"
  type  = "String"
  value = var.primaryRegion

  lifecycle {
    ignore_changes = [
      value
    ]
  }
}

output "activeRegion_param_name" {
  value = aws_ssm_parameter.activeRegion.name
}