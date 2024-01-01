data "azurerm_subscription" "current" {}

resource "azurerm_resource_group" "games" {
  name     = "games"
  location = "westus2"
}

resource "azurerm_resource_group" "deus" {
  name     = "deus"
  location = local.default_workload_location
}
