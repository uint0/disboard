type WebhookResponse = {
    content: string;
};

export default class DiscordDeferredReponder {
    private token: string;
    private applicationId: string;

    constructor({ token, applicationId }: { token: string; applicationId: string }) {
        this.token = token;
        this.applicationId = applicationId;
    }

    async text(content: string): Promise<void> {
        await this.respond({ content });
    }

    async respond(response: WebhookResponse): Promise<void> {
        const resp = await fetch(
            `https://discordapp.com/api/webhooks/${this.applicationId}/${this.token}/messages/@original`,
            {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(response),
            },
        );
        if (!resp.ok) {
            throw new Error(`Failed to update message: ${resp.status}\n${await resp.text()}`);
        }
    }
}
