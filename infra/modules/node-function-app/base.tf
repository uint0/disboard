locals {
  default_tags = {
    disboard_component = var.name
  }
}

resource "azurerm_storage_account" "storage" {
  name                     = "disboard${var.name}"
  location                 = var.location
  resource_group_name      = var.resource_group_name
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = local.default_tags
}

resource "azurerm_service_plan" "consumption_plan" {
  name                = var.name
  location            = var.location
  resource_group_name = var.resource_group_name
  os_type             = "Linux"
  sku_name            = "Y1"
  tags                = local.default_tags
}

resource "azurerm_linux_function_app" "app" {
  name                = "disboard${var.name}"
  resource_group_name = var.resource_group_name
  location            = var.location

  storage_account_name       = azurerm_storage_account.storage.name
  storage_account_access_key = azurerm_storage_account.storage.primary_access_key
  service_plan_id            = azurerm_service_plan.consumption_plan.id

  app_settings = merge(var.app_settings, {
    WEBSITE_RUN_FROM_PACKAGE = "1"
  })

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

  tags = local.default_tags
}

resource "azurerm_role_assignment" "execution_role_assignment" {
  count              = var.role != null ? 1 : 0
  scope              = var.role.scope
  role_definition_id = var.role.id
  principal_id       = azurerm_linux_function_app.app.identity.0.principal_id
}
