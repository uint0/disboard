locals {
  deus_default_tags = {
    disboard_component = "deus"
  }
}

resource "azurerm_storage_account" "disboarddeus" {
  name                     = "disboarddeus"
  location                 = local.default_workload_location
  resource_group_name      = azurerm_resource_group.deus.name
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = local.deus_default_tags
}

resource "azurerm_service_plan" "deus" {
  name                = "deus"
  location            = local.default_workload_location
  resource_group_name = azurerm_resource_group.deus.name
  os_type             = "Linux"
  sku_name            = "Y1"
  tags                = local.deus_default_tags
}

resource "azurerm_linux_function_app" "deus" {
  name                = "disboarddeus"
  resource_group_name = azurerm_resource_group.deus.name
  location            = local.default_workload_location

  storage_account_name       = azurerm_storage_account.disboarddeus.name
  storage_account_access_key = azurerm_storage_account.disboarddeus.primary_access_key
  service_plan_id            = azurerm_service_plan.deus.id

  app_settings = {
    SUBSCRIPTION_ID          = data.azurerm_subscription.current.subscription_id
    DEFAULT_RESOURCE_GROUP   = azurerm_resource_group.games.name
    WEBSITE_RUN_FROM_PACKAGE = "1"
  }

  identity {
    type = "SystemAssigned"
  }

  site_config {
    application_stack {
      node_version = 18
    }
  }

  lifecycle {
    ignore_changes = [
      app_settings["WEBSITE_RUN_FROM_PACKAGE"]
    ]
  }

  tags = local.deus_default_tags
}

resource "azurerm_role_assignment" "deus_execution_role" {
  scope              = azurerm_resource_group.games.id
  role_definition_id = azurerm_role_definition.deus_execution_role.role_definition_resource_id
  principal_id       = azurerm_linux_function_app.deus.identity.0.principal_id
}

resource "azurerm_role_definition" "deus_execution_role" {
  name        = "deus-game-instance-lifecycler"
  scope       = azurerm_resource_group.games.id
  description = "Allows deus lifecycle management of game instances"

  permissions {
    actions = [
      "Microsoft.Resources/resources/read",
      "Microsoft.ContainerInstance/containerGroups/read",
      "Microsoft.ContainerInstance/containerGroups/restart/action",
      "Microsoft.ContainerInstance/containerGroups/stop/action",
      "Microsoft.ContainerInstance/containerGroups/start/action",
    ]
  }

  assignable_scopes = [azurerm_resource_group.games.id]
}
