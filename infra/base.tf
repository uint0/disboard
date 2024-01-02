data "azurerm_subscription" "current" {}

resource "azurerm_resource_group" "games" {
  name     = "games"
  location = "westus2"
}
