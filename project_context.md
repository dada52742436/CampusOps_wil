# Project Context — Piano Listing Platform (Melbourne)

> 用于在新对话中恢复上下文。当前状态：**Phase 2 Booking 模块完成 — schema、service、controller、前端页面全部就绪。**

---

## 项目概述

在 `x:\my-project150326` 下搭建了一个墨尔本二手钢琴交易平台，包含：

- **Backend**: NestJS 11 (strict TypeScript) + Prisma 7 + PostgreSQL + JWT
- **Frontend**: React 19 + Vite 8 + TypeScript + React Router v7 + Axios
- **背景**: 墨尔本二手钢琴平台（货币 AUD $）
- **功能**: 用户注册、登录、bcrypt 密码存储、JWT 认证、Listing CRUD（含所有者权限校验）

---

## 目录结构

```
x:\my-project150326\
├── .gitignore
├── README.md
├── project_context.md
├── backend\
│   ├── package.json            ← 含 "type": "module"（关键！）
│   ├── tsconfig.json
│   ├── prisma.config.ts        ← Prisma 7 配置，含 datasource.url
│   ├── .env                    ← DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN
│   ├── .env.example
│   ├── prisma\
│   │   ├── schema.prisma       ← User + Listing 模型，含 Condition enum
│   │   └── migrations\         ← init + add_listing_model + add_condition_enum
│   ├── generated\
│   │   └── prisma\
│   │       └── package.json    ← {"type":"module"}（关键！）
│   └── src\
│       ├── main.ts             ← 端口 3001, CORS, ValidationPipe
│       ├── app.module.ts       ← ConfigModule, PrismaModule, UsersModule, AuthModule, ListingsModule
│       ├── prisma\
│       │   ├── prisma.service.ts
│       │   └── prisma.module.ts
│       ├── users\
│       │   ├── users.service.ts
│       │   └── users.module.ts
│       ├── auth\
│       │   ├── dto\
│       │   │   ├── register.dto.ts
│       │   │   └── login.dto.ts
│       │   ├── auth.service.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.module.ts
│       │   ├── jwt.strategy.ts
│       │   └── jwt-auth.guard.ts
│       ├── listings\
│       │   ├── condition.enum.ts      ← Phase 1 新增：Condition TypeScript enum
│       │   ├── dto\
│       │   │   ├── create-listing.dto.ts   ← @IsEnum(Condition)
│       │   │   └── update-listing.dto.ts   ← @IsEnum(Condition)
│       │   ├── listings.service.ts
│       │   ├── listings.controller.ts
│       │   └── listings.module.ts
│       ├── bookings\                       ← Phase 2 新增
│       │   ├── booking-status.enum.ts      ← BookingStatus TypeScript enum
│       │   ├── dto\
│       │   │   ├── create-booking.dto.ts
│       │   │   └── update-booking-status.dto.ts
│       │   ├── bookings.service.ts
│       │   ├── bookings.controller.ts
│       │   └── bookings.module.ts
│       └── protected\
│           └── protected.controller.ts
└── frontend\
    ├── package.json
    ├── vite.config.ts          ← port:3000, proxy /api → localhost:3001
    └── src\
        ├── main.tsx
        ├── App.tsx             ← 所有路由（含 listings 路由）
        ├── constants\
        │   └── conditions.ts  ← Phase 1 新增：CONDITIONS 数组 + CONDITION_LABELS map
        ├── api\
        │   ├── auth.ts         ← axios 实例 + 拦截器 + auth API
        │   ├── listings.ts     ← Phase 1：401 response interceptor，ListingCondition 从 constants 导入
        │   └── bookings.ts    ← Phase 2 新增：createBooking / getMyBookings / getListingBookings / updateBookingStatus
        ├── context\
        │   └── AuthContext.tsx ← 全局 auth 状态 + localStorage
        ├── components\
        │   └── ProtectedRoute.tsx
        └── pages\
            ├── LoginPage.tsx
            ├── RegisterPage.tsx
            ├── DashboardPage.tsx
            ├── ListingsPage.tsx          ← Phase 1：CONDITION_LABELS 显示
            ├── ListingDetailPage.tsx     ← Phase 1：CONDITION_LABELS 显示
            ├── CreateListingPage.tsx     ← Phase 1：CONDITIONS 从 constants 导入
            ├── MyListingsPage.tsx        ← Phase 1：CONDITION_LABELS 显示；Phase 2：Bookings 按钮
            ├── EditListingPage.tsx       ← Phase 1：CONDITIONS 从 constants 导入
            ├── MyBookingsPage.tsx        ← Phase 2 新增：买家已提交的预约列表（可取消 pending）
            └── ListingBookingsPage.tsx  ← Phase 2 新增：卖家查看某 listing 的所有预约（可接受/拒绝）
```

---

## 技术栈与版本

| 技术 | 版本 | 备注 |
|------|------|------|
| NestJS | 11 | strict 模式 |
| Prisma | 7.5.0 | 破坏性变更：需要 driver adapter，url 在 prisma.config.ts |
| @prisma/adapter-pg | 7.x | Prisma 7 必须 |
| PostgreSQL | 本地 5432 | 数据库名：auth_demo |
| @nestjs/jwt | latest | JWT 签发/验证 |
| passport-jwt | latest | Bearer token 提取 |
| bcrypt | latest | saltRounds=10 |
| class-validator | latest | DTO 字段校验 |
| React | 19 | |
| Vite | 8 | |
| react-router-dom | 7 | |
| axios | 1 | |

---

## 关键技术细节（踩坑记录）

### 1. Prisma 7 — url 不能放在 schema.prisma

**问题**: `The datasource property 'url' is no longer supported in schema files`

**解决**: `url` 必须放在 `prisma.config.ts` 的 `datasource.url`，schema 里只留 `provider`：

```prisma
// schema.prisma — 正确
datasource db {
  provider = "postgresql"
}
```

```typescript
// prisma.config.ts — 正确
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url: process.env["DATABASE_URL"] },
});
```

### 2. Prisma 7 + Node.js 22 ESM/CJS 冲突（已解决）

**解决方案**（三处修改）:
1. `backend/package.json` 添加 `"type": "module"`
2. 创建 `backend/generated/prisma/package.json`，内容为 `{"type": "module"}`
3. 所有 import 使用 `.js` 扩展名

### 3. Prisma 7 使用组合模式（非继承）

```typescript
// prisma.service.ts
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

export class PrismaService {
  readonly prisma: PrismaClient;
  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    this.prisma = new PrismaClient({ adapter });
  }
}
// 用法：this.prismaService.prisma.listing.findMany(...)
```

### 4. Prisma 7 schema.prisma generator 配置

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../generated/prisma"
  moduleFormat = "esm"
}
```

### 5. JWT `expiresIn` TypeScript 类型问题

```typescript
expiresIn: process.env.JWT_EXPIRES_IN as `${number}${'s'|'m'|'h'|'d'}`,
```

---

## 数据库 Schema

```prisma
enum Condition {
  new
  like_new
  good
  fair
  poor
}

model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  username  String
  password  String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  listings  Listing[]
  bookings  Booking[] @relation("BookingBuyer")   // Phase 2
  @@map("users")
}

model Listing {
  id          Int       @id @default(autoincrement())
  title       String
  description String
  price       Float
  brand       String?
  condition   Condition
  location    String?
  ownerId     Int
  owner       User      @relation(fields: [ownerId], references: [id])
  bookings    Booking[]                            // Phase 2
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  @@map("listings")
}

// Phase 2 — 新增
enum BookingStatus {
  pending
  accepted
  rejected
  cancelled
}

model Booking {
  id        Int           @id @default(autoincrement())
  listingId Int
  listing   Listing       @relation(fields: [listingId], references: [id])
  buyerId   Int
  buyer     User          @relation("BookingBuyer", fields: [buyerId], references: [id])
  status    BookingStatus @default(pending)
  message   String?
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  @@unique([listingId, buyerId])
  @@map("bookings")
}
```

- **数据库名**: `auth_demo`
- **用户**: `postgres` / **端口**: `5432`

---

## API 端点

### Auth
| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /auth/register | 注册，返回 JWT + user | 无 |
| POST | /auth/login | 登录，返回 JWT + user | 无 |
| GET  | /protected/profile | 当前用户信息 | Bearer Token |

### Listings
| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET    | /listings       | 所有 listings（含 owner 公开信息） | 无 |
| GET    | /listings/mine  | 当前用户的 listings | JWT |
| GET    | /listings/:id   | 单个 listing 详情 | 无 |
| POST   | /listings       | 创建 listing | JWT |
| PATCH  | /listings/:id   | 编辑（仅本人，否则 403） | JWT |
| DELETE | /listings/:id   | 删除（仅本人，否则 403） | JWT |

### Bookings（Phase 2）
| 方法 | 路径 | 描述 | 认证 | 权限 |
|------|------|------|------|------|
| POST  | /listings/:listingId/bookings | 提交预约 | JWT | 买家（非 listing 所有者）|
| GET   | /bookings/mine                | 我的所有预约 | JWT | 本人 |
| GET   | /listings/:listingId/bookings | 某 listing 的所有预约 | JWT | 卖家（listing 所有者）|
| PATCH | /bookings/:id/status          | 更新预约状态 | JWT | 卖家（accepted/rejected）或买家（cancelled）|

**状态机**: `pending` → { 卖家: `accepted` / `rejected`；买家: `cancelled` }。只有 pending 状态可被修改。  
**约束**: 同一 (listingId, buyerId) 只能有一条预约（DB `@@unique`）。

---

## 前端路由

| 路径 | 组件 | 保护 |
|------|------|------|
| `/` | → redirect `/listings` | — |
| `/listings` | `ListingsPage` | 公开 |
| `/listings/:id` | `ListingDetailPage` | 公开 |
| `/listings/new` | `CreateListingPage` | ProtectedRoute |
| `/listings/mine` | `MyListingsPage` | ProtectedRoute |
| `/listings/:id/edit` | `EditListingPage` | ProtectedRoute |
| `/login` | `LoginPage` | 公开 |
| `/register` | `RegisterPage` | 公开 |
| `/dashboard` | `DashboardPage` | ProtectedRoute |
| `/bookings/mine` | `MyBookingsPage` | ProtectedRoute |
| `/listings/:id/bookings` | `ListingBookingsPage` | ProtectedRoute |

**登录/注册成功后跳转**: `/listings`（非 `/dashboard`）

---

## 环境变量 (`backend/.env`)

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/auth_demo"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
```

---

## 启动命令

```powershell
# 终端 1 — 后端 (http://localhost:3001)
Set-Location x:\my-project150326\backend
npm run start:dev

# 终端 2 — 前端 (http://localhost:3000)
Set-Location x:\my-project150326\frontend
npm run dev
```

---

## 下一步方向（未实现）

- 全局 Navbar 导航栏
- 搜索 / 筛选（价格、品牌、成色）
- 图片上传
- 买家联系卖家（消息系统）
- Listing 状态字段（active / sold / archived）
- Tailwind CSS 迁移

---

## Phase 2 变更记录（2026-03-21）

### 后端
- **`prisma/schema.prisma`**：新增 `BookingStatus` enum（pending/accepted/rejected/cancelled）、`Booking` 模型（含 `@@unique([listingId, buyerId])`）、User 和 Listing 反向关联
- **迁移**：新增 `20260321060510_add_booking_model` migration
- **`src/bookings/booking-status.enum.ts`**（新文件）：TypeScript enum，供 DTO/Service 使用（不从 generated client 导入）
- **`src/bookings/dto/create-booking.dto.ts`**（新文件）：`message?: string`，`@MaxLength(500)`
- **`src/bookings/dto/update-booking-status.dto.ts`**（新文件）：`@IsEnum(BookingStatus)`
- **`src/bookings/bookings.service.ts`**（新文件）：create（400/404/409）、findByBuyer、findByListing（403）、updateStatus（状态机 + 所有权校验）
- **`src/bookings/bookings.controller.ts`**（新文件）：4 条路由，`@Controller()` 无前缀以支持两种 URL 模式
- **`src/bookings/bookings.module.ts`**（新文件）：注册 Service 和 Controller
- **`src/app.module.ts`**：注册 `BookingsModule`

### 前端
- **`src/api/bookings.ts`**（新文件）：`BookingStatus` 类型、`Booking` interface、4 个 API 函数 + 401 interceptor
- **`src/pages/MyBookingsPage.tsx`**（新文件）：买家的预约列表，按状态着色，pending 可取消
- **`src/pages/ListingBookingsPage.tsx`**（新文件）：卖家查看某 listing 预约，可接受/拒绝
- **`src/App.tsx`**：新增 `/bookings/mine`、`/listings/:id/bookings` 两条受保护路由
- **`src/pages/ListingDetailPage.tsx`**：listing 详情页下方新增预约区块（卖家→管理链接；买家→预约表单；未登录→登录提示）
- **`src/pages/MyListingsPage.tsx`**：每行新增"Bookings"按钮，跳转到该 listing 的预约管理页
- **`src/pages/ListingsPage.tsx`**：头部新增"My Bookings"链接（仅登录用户可见）

---

## Phase 1 变更记录（2026-03-21）

### 后端
- **`prisma/schema.prisma`**：新增 `enum Condition { new like_new good fair poor }`，`Listing.condition` 从 `String` 改为 `Condition`
- **迁移**：新增 `20260321054941_add_condition_enum` migration
- **`src/listings/condition.enum.ts`**（新文件）：TypeScript enum，与 Prisma enum 保持同步，供 DTO 使用
- **`src/listings/dto/create-listing.dto.ts`**：`@IsIn` → `@IsEnum(Condition)`，去除 `VALID_CONDITIONS` 常量
- **`src/listings/dto/update-listing.dto.ts`**：同上

### 前端
- **`src/constants/conditions.ts`**（新文件）：`CONDITIONS` 数组（含 value/label）+ `CONDITION_LABELS` map + `ListingCondition` 类型 —— 整个前端的单一数据源
- **`src/api/listings.ts`**：`ListingCondition` 从 `constants/conditions` 导入（不再在此处定义）；新增 **401 response interceptor**：token 过期时自动清除 localStorage 并跳转 `/login`
- **`CreateListingPage.tsx` / `EditListingPage.tsx`**：`CONDITIONS` 从 `constants/conditions` 导入，去除本地重复定义
- **`ListingsPage.tsx` / `ListingDetailPage.tsx` / `MyListingsPage.tsx`**：`condition.replace('_', ' ')` → `CONDITION_LABELS[listing.condition]`，显示规范化标签（如 "Like New"）

---

