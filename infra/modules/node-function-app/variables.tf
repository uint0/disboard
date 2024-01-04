variable "name" {
  type        = string
  description = "Short name of the functionapp. Will be prefixed with disboard"
}

variable "location" {
  type        = string
  description = "Region to which resources should be deployed"
}

variable "resource_group_name" {
  type        = string
  description = "The resource group to which resources should be deployed"
}

variable "app_settings" {
  type        = map(string)
  description = "Application configuration"
  default     = {}
}

variable "role" {
  type = object({
    id    = string,
    scope = string,
  })
  description = "A role id and scope which should be used by the function app"
  default     = null
}