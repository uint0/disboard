import { HttpRequest as AzureHttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { TObject } from "@sinclair/typebox";
import { Value, ValueErrorIterator } from "@sinclair/typebox/value";
import { AzureHttpRequestContext, HttpRequest, HttpResponse } from "./types";

type HttpHandlerParams = {
    path?: TObject;
    body?: TObject;
    handler: (request: HttpRequest, context: AzureHttpRequestContext) => Promise<HttpResponse>;
};

function badValidation(error: string, validationFailures: ValueErrorIterator): HttpResponseInit {
    return {
        status: 400,
        jsonBody: {
            error,
            details: { validationFailures: [...validationFailures] },
        },
    };
}

export default function httpHandler(
    opts: HttpHandlerParams,
): (req: AzureHttpRequest, context: InvocationContext) => Promise<HttpResponseInit> {
    async function internalHandler(req: AzureHttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
        if (opts.path !== undefined) {
            if (!Value.Check(opts.path, req.params)) {
                return badValidation("invalid path parameters", Value.Errors(opts.path, req.params));
            }
        }

        let body = undefined;
        if (opts.body !== undefined) {
            body = await req.json(); // TODO: handle Unexpected end of JSON input
            if (!Value.Check(opts.body, body)) {
                return badValidation("invalid request body", Value.Errors(opts.body, body));
            }
        }

        return await opts.handler(
            {
                path: req.params,
                body: body,
            },
            {
                rawRequest: req,
                context,
            },
        );
    }

    return internalHandler;
}
