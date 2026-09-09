import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PassportModule.register({
    defaultStrategy: 'jwt'
  }),
  JwtModule.register({
    secret: process.env.JWT_SECRET || 'vaultflow-secret-key-2026',
    signOptions: { expiresIn: '1d' },
  })],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, JwtAuthGuard],
  exports: [UsersService, JwtModule, PassportModule]
})
export class UsersModule { }
