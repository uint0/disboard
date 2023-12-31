import { HttpResponse } from "./types";

export const response: Record<string, <T = unknown>(r: T) => HttpResponse<T>> = {
    ok: <T>(jsonBody: T) => ({ status: 200, jsonBody }),
    accepted: <T>(jsonBody: T) => ({ status: 202, jsonBody }),
    notFound: <T>(jsonBody: T) => ({ status: 404, jsonBody }),
};
