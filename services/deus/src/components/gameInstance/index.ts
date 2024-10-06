import { GenericResourceExpanded, ResourceManagementClient } from "@azure/arm-resources";
import { DefaultAzureCredential } from "@azure/identity";
import GameInstance from "./GameInstance";
import { DEFAULT_RESOURCE_GROUP, SUBSCRIPTION_ID, TENANT_ID } from "../../constants/azure";
import ContainerGroupGameInstance from "./ContainerGroupGameInstance";
import VirtualMachineGameInstance from "./VirtualMachineGameInstance";

export default class GameInstanceManager {
    static HANDLED_AZURE_TYPE = "Microsoft.Compute/virtualMachines";

    private static resourcesClient = new ResourceManagementClient(new DefaultAzureCredential({
        tenantId: TENANT_ID,
        authorityHost: `https://login.microsoftonline.com/${TENANT_ID}` 
    }), SUBSCRIPTION_ID);

    static async list(game?: string): Promise<GameInstance[]> {
        let filter = game === undefined ? undefined : `tagName eq 'game' and tagValue eq '${game}'`;

        const resources = this.resourcesClient.resources.listByResourceGroup(DEFAULT_RESOURCE_GROUP, {
            filter,
        });

        const gameInstanceResources: {
            resource: GenericResourceExpanded;
            game: string;
            instance: string;
            component: string;
        }[] = [];
        for await (const resource of resources) {
            const {
                game: resourceGame,
                game_instance: resourceGameInstance,
                game_component: resourceGameComponent,
            } = resource.tags ?? {};

            if (
                resourceGame === undefined ||
                resourceGameInstance === undefined ||
                resourceGameComponent === undefined
            ) {
                console.warn(
                    `Found game resource without all game, game_instance, and game_component tags: ${resource.id}. Ignoring`,
                );
                continue;
            }

            gameInstanceResources.push({
                resource,
                game: resourceGame,
                instance: resourceGameInstance,
                component: resourceGameComponent,
            });
        }

        return gameInstanceResources
            .filter((r) => r.component === "compute") // TODO: handle multiple compute for one instance
            .map(({ game: rGame, instance, resource }) => this.buildGameInstanceForResource(rGame, instance, resource));
    }

    static async find(game: string, instance: string): Promise<GameInstance | null> {
        // TODO: how to filter multiple tags at once
        const gameInstance = (await this.list(game)).filter((i) => i.instance === instance);
        if (gameInstance.length === 0) {
            return null;
        }
        if (gameInstance.length > 1) {
            // TODO
            throw Error("games with more than 1 compute instance are currently unsupported");
        }

        return gameInstance[0];
    }

    private static buildGameInstanceForResource(
        game: string,
        instance: string,
        resource: GenericResourceExpanded,
    ): GameInstance {
        switch (resource.type) {
            case ContainerGroupGameInstance.HANDLED_AZURE_TYPE:
                return new ContainerGroupGameInstance({ game, instance }, { compute: resource });
            case VirtualMachineGameInstance.HANDLED_AZURE_TYPE:
                return new VirtualMachineGameInstance({ game, instance }, { compute: resource });
            default:
                throw Error(`unsupported game resource type ${resource.type} for ${resource.name} [${resource.id})]`);
        }
    }
}
