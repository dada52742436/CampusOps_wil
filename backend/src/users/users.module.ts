import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Module({
  providers: [UsersService],
  // exports 让 AuthModule 可以注入 UsersService
  // 不 export 的话，AuthService 就无法使用 UsersService
  exports: [UsersService],
})
export class UsersModule {}
