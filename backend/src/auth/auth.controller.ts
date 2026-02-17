import {
  Controller,
  Request as NestRequest,
  Post,
  UseGuards,
  Get,
  Body,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { IUserWithoutPassword } from '../types/interfaces/user.interface';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@NestRequest() req: Request) {
    return this.authService.login(req.user as IUserWithoutPassword);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.username,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@NestRequest() req: Request) {
    return req.user;
  }
}
