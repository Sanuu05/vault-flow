import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Recursively transforms Prisma Decimal objects into plain JS numbers.
 *
 * Prisma uses decimal.js internally. When `toJSON` isn't patched correctly,
 * Decimal fields come back as { s: 1, e: 3, d: [7500] } (Decimal.js internal format).
 *
 * This interceptor intercepts every response and converts those objects to numbers
 * before the payload is serialized to JSON.
 */
function transformDecimals(value: unknown): unknown {
    if (value === null || value === undefined) return value;

    // Detect Decimal.js internal object: { s: number, e: number, d: number[] }
    if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        's' in (value as Record<string, unknown>) &&
        'e' in (value as Record<string, unknown>) &&
        'd' in (value as Record<string, unknown>) &&
        Array.isArray((value as Record<string, unknown>).d)
    ) {
        const dec = value as { s: number; e: number; d: number[] };
        // Reconstruct: first digit-group is un-padded, subsequent groups are 7-digit-padded
        const digits = dec.d
            .map((n, i) => (i === 0 ? String(n) : String(n).padStart(7, '0')))
            .join('');
        const intLen = dec.e + 1;
        const numStr =
            intLen >= digits.length
                ? digits.padEnd(intLen, '0')
                : digits.slice(0, intLen) + '.' + digits.slice(intLen);
        return dec.s * parseFloat(numStr);
    }

    if (Array.isArray(value)) {
        return value.map(transformDecimals);
    }

    if (typeof value === 'object') {
        const out: Record<string, unknown> = {};
        for (const key of Object.keys(value as Record<string, unknown>)) {
            out[key] = transformDecimals((value as Record<string, unknown>)[key]);
        }
        return out;
    }

    return value;
}

@Injectable()
export class DecimalTransformInterceptor implements NestInterceptor {
    intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
        return next.handle().pipe(map(data => transformDecimals(data)));
    }
}
