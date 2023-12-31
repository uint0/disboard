locals {
  deus_default_tags = {
    disboard_component = "deus"
  }
}

resource "azurerm_storage_account" "disboarddeus" {
  name                     = "disboarddeus"
  location                 = local.default_workload_location
  resource_group_name      = azurerm_resource_group.games.name
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = local.deus_default_tags
}

resource "azurerm_service_plan" "deus" {
  name                = "deus"
  location            = local.default_workload_location
  resource_group_name = azurerm_resource_group.games.name
  os_type             = "Linux"
  sku_name            = "Y1"
  tags                = local.deus_default_tags
}

resource "azurerm_linux_function_app" "deus" {
  name                = "disboarddeus"
  resource_group_name = azurerm_resource_group.games.name
  location            = local.default_workload_location

  storage_account_name       = azurerm_storage_account.disboarddeus.name
  storage_account_access_key = azurerm_storage_account.disboarddeus.primary_access_key
  service_plan_id            = azurerm_service_plan.deus.id

  site_config {
    application_stack {
      node_version = 18
    }
  }

  tags = local.deus_default_tags
}
