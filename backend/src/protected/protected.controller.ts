import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { User } from '../../generated/prisma/client.js';

// 扩展 Express 的 Request 类型，声明 user 字段
// JwtStrategy.validate() 返回的 User 对象会被 Passport 挂到 req.user 上
interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller('protected')
export class ProtectedController {
  // @UseGuards(JwtAuthGuard)：
  // 请求到达这个路由前，NestJS 先执行 JwtAuthGuard
  // Guard 内部调用 JwtStrategy 验证 token：
  //   - 没有 token / token 格式错误 → 401
  //   - token 签名无效或已过期 → 401
  //   - token 有效 → 把 user 挂到 req.user，继续执行 handler
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: AuthenticatedRequest) {
    const { password: _, ...safeUser } = req.user;
    // 解构时排除 password 字段，即使数据库对象带着它，也不返回给前端
    return {
      message: '你已登录，这是受保护的数据',
      user: safeUser,
    };
  }
}
