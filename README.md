# Greeting Card Platform - AI-Powered E-Greeting Cards

一个现代化的AI驱动电子贺卡平台，支持多语言、智能推荐和在线编辑。

## ✨ 主要功能

- 🤖 AI智能文案生成
- 🌍 GEO智能推荐和多语言支持
- 🎨 在线可视化编辑器（Fabric.js）
- 💳 订阅和支付系统（PayPal）
- 📱 响应式设计，支持多设备

## 🚀 快速开始

### 前端
```bash
cd frontend
npm install
npm run dev
```

### 后端
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## 📦 技术栈

**前端**：Next.js 14, React, TypeScript, Tailwind CSS, Fabric.js  
**后端**：Node.js, Express, TypeScript, Prisma  
**数据库**：PostgreSQL  
**AI**：OpenAI GPT-3.5/GPT-4  
**支付**：PayPal SDK

## 📚 文档

- [部署指南](docs/deployment-guide.md)
- [测试指南](docs/testing-guide.md)
- [API文档](docs/api-docs.md)

## 🌐 部署

项目已优化用于部署到：
- **前端**: Vercel (推荐)
- **后端**: Render / Railway
- **数据库**: Render PostgreSQL / Supabase

详细部署步骤请查看部署指南。

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Pull Request 或 Issue！
