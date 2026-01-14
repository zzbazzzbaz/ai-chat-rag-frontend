# 知识库问答助手 - 前端

基于 React 19 + TypeScript 构建的智能问答系统前端，提供用户对话界面和管理后台。

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **路由**: React Router v7
- **HTTP 客户端**: Axios
- **Markdown 渲染**: react-markdown + rehype-highlight
- **图标**: Lucide React

## 项目结构

```
frontend/
└── src/
    ├── api/                 # API 客户端
    │   ├── request.ts       # Axios 实例配置
    │   ├── auth.ts          # 认证相关
    │   ├── chat.ts          # 对话相关
    │   ├── admin.ts         # 管理后台
    │   └── user.ts          # 用户相关
    ├── components/
    │   ├── common/          # 通用组件（Toast, Modal, Loading）
    │   ├── layout/          # 布局组件
    │   └── ui/              # UI 组件（Button, Card, Input）
    ├── pages/
    │   ├── auth/            # 登录、注册
    │   ├── chat/            # 对话界面
    │   ├── admin/           # 管理后台
    │   └── user/            # 用户中心
    ├── stores/              # Zustand 状态管理
    │   ├── authStore.ts     # 认证状态
    │   ├── chatStore.ts     # 对话状态
    │   └── appStore.ts      # 应用状态
    ├── types/               # TypeScript 类型定义
    ├── router/              # 路由配置
    ├── lib/                 # 工具函数
    ├── App.tsx
    └── main.tsx
```

## 功能特性

### 用户前台
- 用户注册/登录/登出
- 新建对话、历史对话管理
- 流式回答（SSE）
- Markdown 内容渲染
- 推荐问题快捷提问
- 个人中心、使用统计

### 管理后台
- 用户管理（启用/禁用/删除）
- 知识库管理（上传/删除/重新处理）
- 历史对话查看
- 系统配置（模型、提示词、推荐问题）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

默认运行在 http://localhost:5173

### 3. 构建生产版本

```bash
npm run build
```

## 常用命令

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

## 设计风格

简洁大方，融入中国航天主题元素。

## License

MIT
