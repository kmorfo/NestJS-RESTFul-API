import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const GetRawHeaders = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {

        const req = ctx.switchToHttp().getRequest();

        return req.rawHeaders;
    }
);