import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from 'generated/prisma/enums';

export class AuthenticatedUser {
    userId: string;
    email: string;
    organizationId: string;
    role: UserRole;
}

export const CurrentUser = createParamDecorator(
    (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user: AuthenticatedUser = request.user;
        console.log({ user })
        if (!user) return null;
        return data ? user[data] : user;
    },
);