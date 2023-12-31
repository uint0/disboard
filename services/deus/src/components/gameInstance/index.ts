import { GenericResourceExpanded, ResourceManagementClient } from "@azure/arm-resources";
import { DefaultAzureCredential } from "@azure/identity";
import GameInstance from "./GameInstance";
import { DEFAULT_RESOURCE_GROUP, SUBSCRIPTION_ID } from "../../constants/azure";
import ContainerGroupGameInstance from "./ContainerGroupGameInstance";

export default class GameInstanceBuilder {
    private static resourcesClient = new ResourceManagementClient(new DefaultAzureCredential(), SUBSCRIPTION_ID);

    static async find(game: string, instance: string): Promise<GameInstance | null> {
        // TODO: how to filter multiple tags at once
        const resources = this.resourcesClient.resources.listByResourceGroup(DEFAULT_RESOURCE_GROUP, {
            filter: `tagName eq 'game' and tagValue eq '${game}'`,
        });

        const gameInstanceResources: GenericResourceExpanded[] = [];
        for await (const resource of resources) {
            const tags = resource.tags ?? {};
            if (tags.game_instance == instance && tags.game_component === "compute") {
                gameInstanceResources.push(resource);
            }
        }

        if (gameInstanceResources.length === 0) {
            return null;
        }
        if (gameInstanceResources.length > 1) {
            // TODO
            throw Error("games with more than 1 compute instance are currently unsupported");
        }

        const gameInstanceResource = gameInstanceResources[0]!!;
        switch (gameInstanceResource.type) {
            case ContainerGroupGameInstance.HANDLED_AZURE_TYPE:
                return new ContainerGroupGameInstance({
                    compute: gameInstanceResource,
                });
            default:
                throw Error(
                    `unsupported game resource type ${gameInstanceResource.type} for ${gameInstanceResource.name} [${gameInstanceResource.id})] (game=${game}, instance=${instance})`,
                );
        }
    }
}
