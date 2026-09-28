import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { DecimalTransformInterceptor } from './common/decimal-transform.interceptor';

// Best-effort: patch Prisma.Decimal.prototype.toJSON (works when it's the same runtime instance)
(Prisma.Decimal.prototype as any).toJSON = function () {
    return this.toNumber();
};

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(app.get(Reflector)),
        // Converts any Prisma Decimal {s,e,d} objects to plain numbers in every response
        new DecimalTransformInterceptor(),
    );
    await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
