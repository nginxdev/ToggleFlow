import {
  Controller,
  Request as NestRequest,
  Post,
  UseGuards,
  Get,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { IUserWithoutPassword } from '../types/interfaces/user.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@NestRequest() req: Request) {
    return this.authService.login(req.user as IUserWithoutPassword);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@NestRequest() req: Request) {
    return req.user;
  }
}
