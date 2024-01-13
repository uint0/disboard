variable "game" {
  type        = string
  description = "the name of the game this container is for. significant modded instances of a game should also be represented here (e.g. minecraft, minecraft-vanilla, minecraft-atm9)"
}

variable "name" {
  type        = string
  description = "a unique human readable identifier for this instance of the game without the game name (e.g. default, skyblock)"
}

variable "location" {
  type        = string
  description = "the azure location (region) the resource should be deployed in"
}

variable "resource_group_name" {
  type        = string
  description = "the resource group the resource belongs to"
}

variable "image" {
  type        = string
  description = "the docker image to run for the game"
}

variable "resources" {
  type = object({
    cpu       = number
    memory_gb = number
    disk_gb   = number
  })
  description = "hardware resource allocations"
}

variable "ports" {
  type = list(object({
    port     = number
    protocol = string
    external = bool
  }))
  description = "ports to open on the container for the game. try to keep management ports closed if possible (e.g. rcon)"
}

variable "environment_variables" {
  type        = map(string)
  description = "environment variables for the game container"
  default     = {}
}

variable "secure_environment_variables" {
  type        = map(string)
  description = "secret environment variables for the game container (todo: prefer init container)"
  default     = {}
  sensitive   = true
}

variable "liveness" {
  type = object({
    exec                  = list(string)
    initial_delay_seconds = number
  })
  description = "an optional liveness probe"
  default     = null
}

variable "net_access_type" {
  type        = string
  description = "the network availability of the game. Public indicates the game can be accessed from the public internet"
  default     = "public"
  validation {
    condition     = contains(["public"], var.net_access_type)
    error_message = "net_access_type must be one of \"public\""
  }
}

variable "os_type" {
  type        = string
  description = "the operating system type the game should run on"
  default     = "linux"
}