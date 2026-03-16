import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { User } from '../../generated/prisma/client.js';

// UsersService 只负责数据访问（Data Access Layer）
// 它不关心密码怎么加密、token 怎么签发——那是 AuthService 的职责
// 这样职责分离，代码更清晰，也更容易测试
@Injectable()
export class UsersService {
  // PrismaService 是 @Global() 模块导出的，无需在本模块 imports 中重复引入
  constructor(private readonly prismaService: PrismaService) {}

  // 根据 email 查找用户
  // 用于登录时查找用户是否存在，以及注册时检查 email 是否已被占用
  async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.prisma.user.findUnique({
      where: { email },
    });
  }

  // 根据 id 查找用户
  // 用于 JWT 验证阶段：token 中存的是 userId，需要通过 id 还原完整用户信息
  async findById(id: number): Promise<User | null> {
    return this.prismaService.prisma.user.findUnique({
      where: { id },
    });
  }

  // 创建新用户
  // 注意：password 字段传入的应该是已经由 AuthService 加密好的 hash，而非明文
  async create(data: {
    email: string;
    username: string;
    password: string;
  }): Promise<User> {
    return this.prismaService.prisma.user.create({ data });
  }
}
