variable "primaryRegion" {
  type = string
}

variable "secondaryRegion" {
  type = string
}

variable "allowedAccountIds" {
  type = list
}

variable "roleArn" {
  type = string
}

variable "projectPrefix" {
  type = string
}

variable "environment" {
  type = string
}

variable "tfStateKey" {
  type = string
}

variable "stateBucket" {
  type = string
}

# Not used by terraform, but added here to remove warning
variable "serverlessStateKey" {
  type = string
}

variable "logRetentionInDays" {
  type = number
}