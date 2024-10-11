import { ComputeManagementClient } from "@azure/arm-compute";
import GameInstance, { GameInstanceEffectiveState, GameInstancePointer } from "./GameInstance";
import { DefaultAzureCredential } from "@azure/identity";
import { DEFAULT_RESOURCE_GROUP, SUBSCRIPTION_ID, TENANT_ID } from "../../constants/azure";
import { GenericResourceExpanded } from "@azure/arm-resources";
import * as azt from "../../types/azure/strict";

export default class VirtualMachineGameInstance extends GameInstance {
    static HANDLED_AZURE_TYPE = "Microsoft.Compute/virtualMachines";

    private static defaultClient = new ComputeManagementClient(
        new DefaultAzureCredential({
            tenantId: TENANT_ID,
            authorityHost: `https://login.microsoftonline.com/${TENANT_ID}` 
        }),
        SUBSCRIPTION_ID
    );

    private client: ComputeManagementClient;
    private genericCompute: azt.StrictGenericResourceExpanded;

    constructor(pointer: GameInstancePointer, { compute }: { compute: GenericResourceExpanded }) {
        super(pointer);
        this.client = VirtualMachineGameInstance.defaultClient;
        this.genericCompute = azt.strictGenericResourceExpanded(compute);
    }

    async getEffectiveStatus(): Promise<GameInstanceEffectiveState> {
        const vm = await this.client.virtualMachines.instanceView(DEFAULT_RESOURCE_GROUP, this.genericCompute.name);
        const powerState = vm.statuses?.find(s => s.code?.startsWith('PowerState/'))?.code;

        if(powerState === undefined) {
            throw new Error(`could not retrieve powerState for vm ${this.genericCompute.name}`);
        }

        switch(powerState) {
            case 'PowerState/running':
            case 'PowerState/starting':
                return "Running"
            case 'PowerState/stopping':
            case 'PowerState/stopped':
            case 'PowerState/deallocated':
                return "Stopped"
            default:
                throw new Error(`unknown azure state ${powerState}`)
        }
    }

    async start(): Promise<void> {
        await this.client.virtualMachines.beginStart(DEFAULT_RESOURCE_GROUP, this.genericCompute.name);
    }
    
    async restart(): Promise<void> {
        await this.client.virtualMachines.beginRestart(DEFAULT_RESOURCE_GROUP, this.genericCompute.name);
    }
    
    async stop(): Promise<void> {
        await this.client.virtualMachines.beginDeallocate(DEFAULT_RESOURCE_GROUP, this.genericCompute.name);
    }
}