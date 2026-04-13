import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { HashService } from '../hash/hash.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private hashService: HashService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<User> {
    const user = await this.usersService.findUserWithPassword(username);

    if (!user) {
      throw new UnauthorizedException('Некорректная пара логин и пароль');
    }

    const isPasswordValid = await this.hashService.verify(pass, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Некорректная пара логин и пароль');
    }

    const { password, ...result } = user;

    return result as User;
  }

  auth(user: User) {
    const payload = { sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
