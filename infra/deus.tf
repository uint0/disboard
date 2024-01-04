locals {
  deus_default_tags = {
    disboard_component = "deus"
  }
}

resource "azurerm_resource_group" "deus" {
  name     = "deus"
  location = local.default_workload_location
  tags     = local.deus_default_tags
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

module "deus_function" {
  source = "./modules/node-function-app"

  name                = "deus"
  location            = local.default_workload_location
  resource_group_name = azurerm_resource_group.deus.name
  app_settings = {
    DEFAULT_RESOURCE_GROUP = azurerm_resource_group.games.name
    SUBSCRIPTION_ID        = data.azurerm_subscription.current.subscription_id
  }
  role = {
    id    = azurerm_role_definition.deus_execution_role.role_definition_resource_id
    scope = azurerm_resource_group.games.id
  }
}
