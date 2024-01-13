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
  environment_variables = {
    EULA   = "TRUE"
    MEMORY = "7.5GB"
  }
}

module "minecraft_atm7_skyblock" {
  source = "./modules/game-container"

  game = "minecraft"
  name = "atm7skyblock"

  location            = "australiaeast"
  resource_group_name = azurerm_resource_group.games.name

  image = "itzg/minecraft-server"
  resources = {
    cpu       = 3
    memory_gb = 10
    disk_gb   = 16
  }
  ports = [{
    port     = 25565
    protocol = "TCP"
    external = true
  }]
  liveness = {
    exec                  = ["/usr/local/bin/mc-health"]
    initial_delay_seconds = 120
  }
  environment_variables = {
    EULA                       = "TRUE"
    TYPE                       = "CURSEFORGE"
    CF_SERVER_MOD              = "https://mediafilez.forgecdn.net/files/4497/274/server-1.2.3.zip"
    MEMORY                     = "8G"
    ENABLE_ROLLING_LOGS        = "true"
    SPAWN_PROTECTION           = "0"
    OVERRIDE_SERVER_PROPERTIES = "true"
    DIFFICULTY                 = "hard"
    MAX_TICK_TIME              = "-1"
    ALLOW_FLIGHT               = "true"
    LEVEL_TYPE                 = "skyblockbuilder:skyblock"
  }
}
