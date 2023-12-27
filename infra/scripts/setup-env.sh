#!/usr/env/bin bash

source "$(dirname ${BASH_SOURCE[0]})/constants.sh"

export ARM_ACCESS_KEY="$(az storage account keys list --resource-group "$RESOURCE_GROUP_NAME" --account-name "$STORAGE_ACCOUNT_NAME" --query '[0].value' -o tsv)"