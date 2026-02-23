import {
  Controller,
  Post,
  Body,
  Patch,
  UseGuards,
  Request as NestRequest,
  Get,
  NotFoundException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(
      createUserDto.email,
      createUserDto.username,
      createUserDto.password,
      createUserDto.firstName,
      createUserDto.lastName,
    );
  }

  @UseGuards(AuthGuard("jwt"))
  @Patch("profile")
  updateProfile(@NestRequest() req: Request, @Body() updateProfileDto: UpdateProfileDto) {
    const user = req.user as { userId: string };
    return this.usersService.updateProfile(user.userId, updateProfileDto);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get("profile")
  async getProfile(@NestRequest() req: Request) {
    const userId = (req.user as { userId: string }).userId;
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
