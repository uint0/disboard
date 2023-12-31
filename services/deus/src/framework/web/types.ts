import { HttpRequest as AzureHttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export type HttpRequest = {
    path: any;
    body: any;
};

export type WithBody<T> = { body: T };
export type WithPath<T> = { path: T };

export type HttpResponse<TBody = unknown> = HttpResponseInit & {
    jsonBody: TBody;
};
export type HttpErrorBody<T = unknown> = { error: string; details: T };

export type AzureHttpRequestContext = {
    rawRequest: AzureHttpRequest;
    context: InvocationContext;
};
