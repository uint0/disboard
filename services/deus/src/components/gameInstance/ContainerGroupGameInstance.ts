import { ContainerInstanceManagementClient } from "@azure/arm-containerinstance";
import GameInstance, { GameInstanceEffectiveState } from "./GameInstance";
import { DefaultAzureCredential } from "@azure/identity";
import { DEFAULT_RESOURCE_GROUP, SUBSCRIPTION_ID } from "../../constants/azure";
import { GenericResourceExpanded } from "@azure/arm-resources";
import * as azt from "../../types/azure/strict";

const CONTAINER_GROUP_ACTUAL_STATES = ["Running", "Stopped", "Pending", "Succeeded", "Failed"] as const;
export type ContainerGroupGameInstanceActualState = (typeof CONTAINER_GROUP_ACTUAL_STATES)[number];

function guardActualState(state: string) {
    function typeGuard(s: string): s is ContainerGroupGameInstanceActualState {
        return (<readonly string[]>CONTAINER_GROUP_ACTUAL_STATES).includes(s);
    }
    if (!typeGuard(state)) {
        throw Error(`unexpected state ${state}`);
    }
    return state;
}

export default class ContainerGroupGameInstance extends GameInstance {
    static HANDLED_AZURE_TYPE = "Microsoft.ContainerInstance/containerGroups";

    private static defaultClient = new ContainerInstanceManagementClient(new DefaultAzureCredential(), SUBSCRIPTION_ID);

    private client: ContainerInstanceManagementClient;
    private genericCompute: azt.StrictGenericResourceExpanded;

    constructor({ compute }: { compute: GenericResourceExpanded }) {
        super();
        this.client = ContainerGroupGameInstance.defaultClient;
        this.genericCompute = azt.strictGenericResourceExpanded(compute);
    }

    async getActualState(): Promise<ContainerGroupGameInstanceActualState> {
        const cg = azt.strictContainerGroup(
            await this.client.containerGroups.get(DEFAULT_RESOURCE_GROUP, this.genericCompute.name),
        );
        return guardActualState(cg.instanceView.state);
    }

    async getEffectiveStatus(): Promise<GameInstanceEffectiveState> {
        const actualState = await this.getActualState();
        switch (actualState) {
            case "Pending":
            case "Running":
                return "Running";
            case "Failed":
            case "Stopped":
            case "Succeeded":
                return "Stopped";
            default:
                throw new Error(`unknown azure state ${actualState}`);
        }
    }
    async start(): Promise<void> {
        await this.client.containerGroups.beginStart(DEFAULT_RESOURCE_GROUP, this.genericCompute.name);
    }
    async restart(): Promise<void> {
        await this.client.containerGroups.beginRestart(DEFAULT_RESOURCE_GROUP, this.genericCompute.name);
    }
    async stop(): Promise<void> {
        await this.client.containerGroups.stop(DEFAULT_RESOURCE_GROUP, this.genericCompute.name);
    }
}
