# 云秀通 · 家政工单调度系统（管理端）

家政服务工单调度平台的**管理端前端**，前后端分离架构。

- 前端仓库（本仓库）：`yunxiutong-web`
- 后端仓库：[yunxiutongSystem](https://github.com/demoLover-learn/yunxiutongSystem)

## 项目简介

平台面向三类角色：**用户**（下单）、**师傅**（接单上门）、**管理员**（派单与运营）。本仓库实现管理员端，负责工单调度、师傅与用户管理、服务目录维护、评价管理。

后端提供 `/api/admin/**`、`/api/user/**`、`/api/worker/**` 三套接口，各自独立鉴权。

## 技术栈

| 分类 | 选型 |
| --- | --- |
| 框架 | Vue 3（组合式 API + `<script setup>`） |
| 构建 | Vite |
| UI | Element Plus |
| 路由 | Vue Router（嵌套路由 + 全局前置守卫） |
| 状态 | Pinia |
| 请求 | Axios（实例封装 + 请求/响应拦截器） |
| 样式 | 原生 CSS（`main.css` 统一后台骨架 + 页面级 `scoped`） |

## 功能模块

| 模块 | 能力 |
| --- | --- |
| 登录鉴权 | 账号登录、JWT 落地、路由守卫拦截、退出登录（服务端 token 撤销） |
| 后台布局 | 侧边栏菜单、顶栏、面包屑高亮跟随 URL |
| 工单管理 | 分页、按订单号/用户/状态查询、详情弹窗、派单、取消工单 |
| 师傅管理 | 分页、按姓名查询、启用/禁用、下拉可选师傅 |
| 用户管理 | 分页、按昵称/手机号/状态查询、启用/禁用 |
| 评价管理 | 分页、按订单号/用户/师傅查询、删除 |
| 服务分类 | 分页、新增、编辑、启用/禁用、删除 |
| 服务项目 | 分页、按分类筛选、新增、编辑、上架/下架、删除 |

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器（默认 http://localhost:5173）
pnpm dev

# 生产构建
pnpm build
```

开发前请先启动后端（默认 `http://localhost:8080`），接口代理已在 `vite.config.js` 中配置：

```js
server: {
  proxy: {
    '/api': { target: 'http://localhost:8080', changeOrigin: true },
    '/uploads': { target: 'http://localhost:8080', changeOrigin: true }
  }
}
```

## 目录结构

```
src/
├── api/                 # 接口层，按业务模块拆分
│   ├── auth.js          # 登录 / 登出
│   ├── order.js         # 工单
│   ├── worker.js        # 师傅
│   ├── user.js          # 用户
│   ├── comment.js       # 评价
│   ├── serviceCategory.js
│   └── serviceItem.js
├── assets/main.css      # 后台通用布局样式
├── layout/AdminLayout.vue   # 后台骨架（侧边栏 + 顶栏 + 内容区出口）
├── router/index.js      # 路由表 + 全局前置守卫
├── utils/request.js     # Axios 实例与拦截器
└── views/admin/         # 页面
```

分层约定：`router/index.js` 中被 `component: () => import(...)` 引用的放 `views/`，其余放 `components/`。

## 关键实现

**统一的接口层**：`utils/request.js` 创建 Axios 实例，请求拦截器自动注入 token，响应拦截器统一判定业务码并返回业务数据，失败时抛出异常由调用方 `catch`。

**路由守卫做访问控制**：`/admin` 路由声明 `meta.requiresAuth`，守卫用 `to.matched.some()` 判断整条链路是否需要登录，未登录时携带 `redirect` 参数跳转登录页，登录成功后跳回原地址。前端的守卫负责拦截，后端的拦截器负责兜底，两层都在。

**状态机驱动操作按钮**：工单列表的操作按钮不是写死的，派单只在「待接单」可用、取消只在「待接单 / 已接单」可用，与后端状态机校验保持一致。

**三端 token 隔离**：后端三个端点的 token 请求头同名，前端按端区分 localStorage key，避免不同端登录态互相覆盖。

## 说明

本项目为毕业设计作品，管理端已实现上述全部模块；用户端与师傅端开发中。