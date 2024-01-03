export type GameInstanceEffectiveState = "Running" | "Stopped";

export type GameInstancePointer = {
    game: string;
    instance: string;
};

export default abstract class GameInstance {
    public game: string;
    public instance: string;

    constructor({ game, instance }: GameInstancePointer) {
        this.game = game;
        this.instance = instance;
    }

    abstract getEffectiveStatus(): Promise<GameInstanceEffectiveState>;
    abstract start(): Promise<void>;
    abstract restart(): Promise<void>;
    abstract stop(): Promise<void>;
}
