function envOrPanic(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`required envvar ${key} was not found`);
    }
    return value;
}

export const APP_NAME = "dias";
export const SUBSCRIPTION_ID = envOrPanic("SUBSCRIPTION_ID");
export const DEFAULT_RESOURCE_GROUP = process.env["DEFAULT_RESOURCE_GROUP"] ?? "games";
