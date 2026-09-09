import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { UserRole } from "generated/prisma/enums";
import { ExtractJwt, Strategy } from "passport-jwt";



export interface JwtPayload {
    sub: string;            // User ID
    email: string;
    organizationId: string; // Tenant context
    role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            // 1. Automatically grab token from "Authorization: Bearer <token>"
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // 2. Reject expired tokens automatically
            ignoreExpiration: false,
            // 3. Secret used to verify cryptographic signature
            secretOrKey: process.env.JWT_SECRET || 'vaultflow-secret-key-2026',
        });
    }
    // 4. If token is valid, validate() executes and attaches its output to req.user
    async validate(payload: JwtPayload) {
        if (!payload.sub || !payload.organizationId) {
            throw new UnauthorizedException('Malformed token claims.');
        }
        return {
            userId: payload.sub,
            email: payload.email,
            organizationId: payload.organizationId,
            role: payload.role,
        };
    }

}