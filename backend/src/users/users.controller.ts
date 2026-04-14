import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getOwnProfile(@Req() req) {
    return req.user;
  }

  @Patch('me')
  async updateOwnProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateOne(req.user.id, updateUserDto);
  }

  @Get('me/wishes')
  async getOwnWishes(@Req() req) {
    return this.usersService.findWishesByUsername(req.user.username);
  }

  @Post('find')
  async findMany(@Body('query') query: string) {
    return this.usersService.findMany(query);
  }

  @Get(':username/wishes')
  async getUserWishes(@Param('username') username: string) {
    return this.usersService.findWishesByUsername(username);
  }

  @Get(':username')
  async getUserProfile(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }
}
