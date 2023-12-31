export type GameInstanceEffectiveState = "Running" | "Stopped";

export default abstract class GameInstance {
    abstract getEffectiveStatus(): Promise<GameInstanceEffectiveState>;
    abstract start(): Promise<void>;
    abstract restart(): Promise<void>;
    abstract stop(): Promise<void>;
}
