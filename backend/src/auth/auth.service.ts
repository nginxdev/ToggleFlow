import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { IUserWithoutPassword } from '../types/interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<IUserWithoutPassword | null> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  login(user: IUserWithoutPassword) {
    const payload = { email: user.email, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.userId,
        email: user.email,
        username: user.username,
        lastProjectId: user.lastProjectId,
      },
    };
  }

  async register(
    email: string,
    username: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) {
    const user = await this.usersService.create(
      email,
      username,
      password,
      firstName,
      lastName,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;
    return this.login(userWithoutPassword);
  }
}
