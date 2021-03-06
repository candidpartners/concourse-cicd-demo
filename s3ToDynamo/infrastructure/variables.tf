variable "environment" {
  type = string
}

variable "serviceName" {
  type = string
}

variable "region" {
  type = string
}

variable "allowedAccountIds" {
  type = list
}

variable "roleArn" {
  type = string
}


variable "tfStateKey" {
  type = string
}

variable "stateBucket" {
  type = string
}

variable "kmsKey" {
  type = string
}

locals {
  prefix = "${var.environment}-${var.serviceName}"
}
