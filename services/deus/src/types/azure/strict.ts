/**
 * for some reason all the fields on azure's models are optional.
 * I cbf handling these so these are types with the optionality removed
 * I only type the fields i care about, since some might actually be reasonablly optional
 */

import { ContainerGroup } from "@azure/arm-containerinstance";
import { GenericResourceExpanded } from "@azure/arm-resources";

export class StrictTypeError extends Error {}

//region GenericResourceExpended
export type StrictGenericResourceExpanded = GenericResourceExpanded & {
    name: string;
};
export function guardGenericResourceExpanded(t: GenericResourceExpanded): t is StrictGenericResourceExpanded {
    return t.name !== undefined;
}
export function strictGenericResourceExpanded(t: GenericResourceExpanded): StrictGenericResourceExpanded {
    if (!guardGenericResourceExpanded(t)) {
        throw new StrictTypeError(`${t} was expected to be strict but was not`);
    }
    return t;
}
//endregion

//region ContainerGroup
export type StrictContainerGroup = ContainerGroup & {
    instanceView: {
        state: string;
    };
};
export function guardStrictContainerGroup(t: ContainerGroup): t is StrictContainerGroup {
    return t?.instanceView?.state !== undefined;
}
export function strictContainerGroup(t: ContainerGroup): StrictContainerGroup {
    if (!guardStrictContainerGroup(t)) {
        throw new StrictTypeError(`${t} was expected to be strict but was not`);
    }
    return t;
}
//endregion
