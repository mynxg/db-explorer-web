# 数据库探索平台

[![](https://img.shields.io/github/stars/mynxg/db-explorer-web)](https://github.com/mynxg/db-explorer-web/stargazers)
[![](https://img.shields.io/github/issues/mynxg/db-explorer-web)](https://github.com/mynxg/db-explorer-web/issues)
[![](https://img.shields.io/github/issues-closed/mynxg/db-explorer-web)](https://github.com/mynxg/db-explorer-web/issues?q=is%3Aissue+is%3Aclosed)
[![](https://img.shields.io/github/issues-pr/mynxg/db-explorer-web)](https://github.com/mynxg/db-explorer-web/pulls)
[![](https://img.shields.io/github/issues-pr-closed/mynxg/db-explorer-web)](https://github.com/mynxg/db-explorer-web/pulls?q=is%3Apr+is%3Aclosed)


简体中文 | [English](README-EN.md)



一个现代化的数据库查询工具，使用 Next.js 和 React 构建，支持多种数据库类型的连接、查询和数据管理。


![数据库查询工具截图](screenshot.png)


## 功能特点

- 支持多种数据库类型（MySQL, PostgreSQL, Oracle, SQL Server）
- 数据库连接管理与自动重连
- 表结构查看
- 表数据分页浏览
- SQL 查询执行
- 多标签页界面
- 深色/浅色主题切换
- 响应式设计


## 技术栈

- 前端框架: Next.js 14 (App Router)
- UI 组件: Shadcn UI
- 状态管理: React Hooks
- 样式: Tailwind CSS
- 图标: Lucide React
- 通知: React Toastify


## 安装与运行

### 前提条件

- Node.js 18.0 或更高版本
- npm 或 yarn 或 pnpm

### 安装步骤

- 克隆仓库

```bash
git clone git@github.com:mynxg/db-explorer-web.git
cd db-explorer-web
```

- 安装依赖

```bash
npm install
```

- 运行项目  

```bash
npm run dev
```

- 访问项目
>打开浏览器访问：[http://localhost:3000](http://localhost:3000)


## 使用指南

### 连接数据库

- 在左侧面板中填写数据库连接信息
- 选择数据库类型
- 输入主机地址、端口、用户名、密码和数据库名
- 点击"测试连接"验证连接信息
- 点击"连接"建立数据库连接

### 查看表结构
- 连接成功后，左侧会显示数据库中的表列表
- 点击表名打开表标签页
- 在"表结构"选项卡中查看表的字段定义

### 查看表数据
- 在表标签页中，切换到"表数据"选项卡
- 数据以分页方式展示
- 使用底部的分页控件浏览更多数据

### 执行 SQL 查询
- 点击右上角的"新建查询"按钮
- 在 SQL 编辑器中输入 SQL 语句
- 点击"执行"按钮运行查询
- 查询结果将显示在下方

### 配置
本应用使用环境变量进行配置。创建一个 .env.local 文件，可以包含以下配置：

```bash
NEXT_PUBLIC_API_URL=http://localhost:8076/api
```


## 开发

### 项目结构

```
/
├── public/            # 静态资源
├── src/
│   ├── app/           # Next.js 应用路由
│   ├── components/    # React 组件
│   ├── lib/           # 工具函数
│   └── types/         # TypeScript 类型定义
├── .env.local         # 环境变量（需自行创建）
└── ...                # 其他配置文件
```




## 后端项目：

API 接口服务：[db-explorer](git@github.com:mynxg/db-explorer.git)


## Vercel 部署教程
登录 [Vercel](https://vercel.com/) 并创建一个新项目。

选择导入 GitHub 仓库，并选择你的项目仓库（db-explorer-web）。

在项目设置中，添加环境变量：

VIDEO_APP_API_URL：设置为你的 API 地址，例如 https://your-api-url.com
点击“Deploy”按钮开始部署。

部署完成后，你可以在 Vercel 提供的域名上访问你的应用。


## 贡献

欢迎贡献代码、报告问题或提出改进建议！请遵循以下步骤：
- Fork 仓库
- 创建功能分支 (git checkout -b feature/amazing-feature)
- 提交更改 (git commit -m 'Add some amazing feature')
- 推送到分支 (git push origin feature/amazing-feature)
- 创建 Pull Request


## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=mynxg/db-explorer-web&type=Date)](https://star-history.com/#mynxg/db-explorer-web&Date)


