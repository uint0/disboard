resource "azurerm_resource_group" "games" {
  name     = "games"
  location = "westus2"
}

module "minecraft_vanilla" {
  source = "./modules/game-container"

  game = "minecraft"
  name = "default"

  location            = "australiaeast"
  resource_group_name = azurerm_resource_group.games.name

  image = "itzg/minecraft-server:latest"
  resources = {
    cpu       = 3
    memory_gb = 8
    disk_gb   = 8
  }
  ports = [{
    port     = 25565
    protocol = "TCP"
    external = true
  }]
}
