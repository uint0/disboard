import { Type, type Static } from "@sinclair/typebox";

export type ShortGameInstance = {
    game: string;
    instance: string;
};

export const GameInstancePath = Type.Object({
    game: Type.String(),
    instance: Type.String(),
});
export type TGameInstancePath = Static<typeof GameInstancePath>;
