#!/usr/bin/env bash

#
# This script bootstraps remote state needed to use the tofu infrastructure. You should not need to run this script.
#

set -euo pipefail

confirm_or_panic() {
    msg="$1"
    read -n 1 -p "$msg (y/N) " p
    echo

    if [[ "$p" != "y" ]]; then
        echo "exiting"
        exit 1
    fi

    unset p
}

source "$(dirname ${BASH_SOURCE[0]})/constants.sh"

if [[ "$(az group exists --name "$RESOURCE_GROUP_NAME")" == "false" ]]; then
    confirm_or_panic "Resource group [$RESOURCE_GROUP_NAME] doesn't exist. Would you like to create?"
    az group create --name "$RESOURCE_GROUP_NAME" --location eastus
else
    echo "Resource group [$RESOURCE_GROUP_NAME] already exists."
fi

if ! az storage account show --resource-group "$RESOURCE_GROUP_NAME" --name "$STORAGE_ACCOUNT_NAME" &>/dev/null ; then
    confirm_or_panic "Storage account [$STORAGE_ACCOUNT_NAME] doesn't exist. Would you like to create?"
    az storage account create --resource-group "$RESOURCE_GROUP_NAME" --name "$STORAGE_ACCOUNT_NAME" --sku Standard_LRS --encryption-services blob
else
    echo "Storage account [$STORAGE_ACCOUNT_NAME] already exists."
fi

if ! az storage container show --name "$CONTAINER_NAME" --account-name "$STORAGE_ACCOUNT_NAME" &>/dev/null ; then
    confirm_or_panic "Storage container [$CONTAINER_NAME] doesn't exist in storage account [$STORAGE_ACCOUNT_NAME]. Would you like to create?"
    az storage container create --name "$CONTAINER_NAME" --account-name "$STORAGE_ACCOUNT_NAME"
else
    echo "Storage container [$STORAGE_ACCOuNT_NAME/$CONTAINER_NAME] already exists."
fi

echo 'Done'