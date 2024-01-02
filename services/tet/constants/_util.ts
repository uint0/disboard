export function envOrFatal(key: string): string {
    const value = process.env[key];
    if(value === undefined) {
        throw new Error(`required envvar ${key} is missing`);
    }
    return value;
}
