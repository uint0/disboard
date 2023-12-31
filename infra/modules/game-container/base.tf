locals {
  slug                 = "${var.game}-${var.name}"
  slug_hash_short      = substr(sha1(local.slug), 0, 20)
  storage_account_name = "game${local.slug_hash_short}"
  default_tags = {
    game          = var.game
    game_instance = var.name
  }
}

resource "azurerm_container_group" "container" {
  name                = "game-${local.slug}"
  location            = var.location
  resource_group_name = var.resource_group_name
  ip_address_type     = title(var.net_access_type)
  os_type             = title(var.os_type)
  restart_policy      = "Always"

  container {
    name  = local.slug
    image = var.image
    # TODO: consider setting cpu_limit and memory_limit if we spend too much money
    cpu    = var.resources.cpu
    memory = var.resources.memory_gb

    environment_variables        = var.environment_variables
    secure_environment_variables = var.secure_environment_variables

    volume {
      name       = "data"
      mount_path = "/data" # TODO: configurable

      storage_account_name = azurerm_storage_account.storage.name
      storage_account_key  = azurerm_storage_account.storage.primary_access_key
      share_name           = azurerm_storage_share.game_data.name
    }

    dynamic "ports" {
      for_each = var.ports
      content {
        port     = ports.value.port
        protocol = ports.value.protocol
      }
    }
  }

  exposed_port = [for each in var.ports : {
    port     = each.port
    protocol = each.protocol
  } if each.external]

  tags = merge(local.default_tags, {
    game_component = "compute",
  })
}

resource "azurerm_storage_account" "storage" {
  name                     = local.storage_account_name
  location                 = var.location
  resource_group_name      = var.resource_group_name
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = merge(local.default_tags, {
    game_component = "storage"
  })
}

resource "azurerm_storage_share" "game_data" {
  name                 = "gamedata"
  storage_account_name = azurerm_storage_account.storage.name
  quota                = var.resources.disk_gb

  acl {
    id = "default"
    access_policy {
      permissions = "rwdl"
    }
  }
}
