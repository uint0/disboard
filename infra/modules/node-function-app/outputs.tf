output "storage" {
  value = {
    name                      = azurerm_storage_account.storage.name
    primary_connection_string = azurerm_storage_account.storage.primary_connection_string
  }
}

output "function" {
  value = {
    url = "https://${azurerm_linux_function_app.app.default_hostname}"
  }
}