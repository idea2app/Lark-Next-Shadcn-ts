# Next.js 迁移到 ViNext：踩坑记录

这份指南整理了将一个 Pages Router、TypeScript、MobX、MDX 和 Koa 项目迁移到 [ViNext][1] 的实际经验。ViNext 持续演进，迁移前请对照当前版本文档和兼容扫描结果，不要把本文中的 workaround 当作永久 API。

## 先做兼容性盘点

先在独立分支上运行：

```sh
pnpm exec vinext check
```

检查结果是逐项兼容提示，不是完整运行保证。当前项目扫描为 98% 兼容：Pages Router、`next/link`、`next/head`、`next/image`、`next/app`、rewrites 和 `pageExtensions` 被识别；Sentry 的 webpack/Turbopack 构建增强则是部分支持。逐个核对未支持功能，尤其是构建插件、API 路由、ISR 和平台部署行为。

迁移初期应同时保留原有启动方式，先迁移配置和单条代表性路由，再扩展到动态页、API、MDX、静态资源和生产环境。开发服务器能启动不代表所有路由都能渲染，生产构建通过也不代表 development SSR 没有 CommonJS 错误。

## Vite、Rolldown 与插件

Vite 8 使用 Rolldown 构建。MDX 官方包名虽然是 `@mdx-js/rollup`，官方说明支持 Rollup 和 Vite；它是 Vite 插件 API 的兼容插件，不会把构建器切回 Rollup。保留已有 MDX 插件通常比另找非官方 unplugin 更直接。

MDX 配置应保留项目原有的 remark 插件，并确保它在 ViNext 处理页面前转换 `.md`/`.mdx`：

```ts
import mdx from '@mdx-js/rollup';

export default {
plugins: [
  {
    ...mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
    }),
    enforce: 'pre',
  },
  vinext(),
];
}
```

Vite/Rolldown 对 Rollup 插件有兼容层，但不是所有旧插件钩子都保证完全等价；遇到插件问题时，优先核对它使用的 hooks 和当前 Vite 插件兼容说明。

参考：

- [Vite 8 发布说明][2]
- [Vite 插件 API][3]
- [MDX 官方 Rollup/Vite 插件][4]

## SWC 与装饰器

如果代码使用 MobX 的 `@observer`、`@observable`、`@computed` 等装饰器，确认 Vite 转换器启用了 ECMAScript decorators。迁移时使用 `unplugin-swc` 接入 SWC，例如：

```ts
import swc from 'unplugin-swc';

swc.vite({
  jsc: {
    target: 'es2022',
    parser: { syntax: 'typescript', tsx: true, decorators: true },
    transform: {
      decoratorVersion: '2022-03',
      useDefineForClassFields: true,
      react: { runtime: 'automatic' },
    },
  },
});
```

原生 SWC binding 还受操作系统、CPU 架构、Node.js 版本和缓存目录权限影响。在本项目的 GitHub codespaces 容器中，默认缓存目录权限会导致 `Failed to load native binding`。SWC 要求自定义缓存值为绝对路径，因此不能直接配置 `./temp`；仓库通过 `scripts/run-vite.mjs` 在启动子进程前使用 Node.js 的 `os.tmpdir()` 生成系统临时目录下的绝对路径。该方式不依赖 POSIX shell 赋值语法或额外的 `cross-env`，Windows/macOS/Linux 均由 Node.js 选择系统临时目录：

```sh
pnpm build
pnpm dev
```

启动器默认使用系统临时目录下的 `swc-native-binding`；也可通过 `SWC_NATIVE_BINDING_CACHE` 传入绝对目录。若传入相对目录，启动器会先相对于项目根目录解析成绝对路径；特殊值 `0` 原样交给 SWC。若所选文件系统不可执行或权限不允许写入，仍需换到可用的绝对目录。SWC 官方说明见 [Native Addon carrier 文档][5]。

## SSR 中的 CommonJS 依赖

Vite dev 的 SSR 模块运行器和生产 bundle 的执行方式不同。迁移时常见错误包括：

- `exports is not defined`
- `module is not defined`
- `require is not defined`
- SSR 模块执行时报 `Invalid or unexpected token`

这些错误经常来自被错误内联的 CommonJS 依赖。先读堆栈找出真正出错的包，再有针对性地使用 `ssr.external` 交给 Node.js 加载；遇到默认导出/命名导出互操作差异时，再考虑 `ssr.optimizeDeps.include`。例如：

```ts
export default {
ssr: {
  optimizeDeps: { include: ['lodash'] },
  external: ['mobx', 'mobx-react', 'formidable'],
}}
```

不要一开始就设置全局 `ssr.external: true`。本次迁移中它曾导致 React 自身以错误的方式进入 SSR 模块执行，错误从 `react` 转移到 MobX 包，诊断反而更困难。外部化清单应基于当前 Node.js 版本和依赖图逐个验证，并分别测试 development 与 production。

## 保留哪些 Next.js 依赖

迁移到 ViNext 不等于立即删除 `next`。只要源码仍导入 `next/app`、`next/link`、`next/head`、`next/dynamic`、`next/image`、`next/document`，或使用 Next.js 导出的类型，就应先保留 Next.js 兼容包。等源码和其他依赖完全不再需要它时，再验证是否能移除。

`next typegen` 应替换为：

```sh
pnpm exec vinext typegen
```

ViNext 会生成 `.next/types/routes.d.ts`，并维护 `next-env.d.ts`。即使项目是 Pages Router、生成的 App Router 类型为空，只要 `next-env.d.ts` 引用了该文件，干净 checkout 上运行 `tsc` 前仍需生成它。当前项目在安装脚本中调用 `vinext typegen`；CI 也应明确保证 typegen 先于类型检查。

## 整理旧 Next.js 配置

ViNext 只支持 Next.js 配置的一个子集，可用 `vinext check` 查当前版本识别的配置项。尤其注意：

- `webpack` 回调不会由 ViNext 执行，常见提示是 `next.config option "webpack" is not yet supported and will be ignored`。
- 即使回调被忽略，配置文件顶层的 import 和代码仍可能执行。迁移完功能后，应删除只供 webpack 使用的导入及 `webpack`、`copy-webpack-plugin` 等直接依赖。
- 把必须保留的能力迁移到对应的 Vite 插件或 ViNext 支持的配置，不要只删除回调。例如本项目用 Vite 插件替代 webpack 的文章资源复制。
- Sentry 的标准 instrumentation 和包装 API 可工作，但 webpack/Turbopack 的 source map 上传、自动埋点等构建增强不会自动继承；逐项验证监控功能。

## Pages Router、API 与 Koa

Pages Router 文件大多可以保留，但每个 API 文件都要有明确的默认 handler。放在 `pages/api` 下的 helper 模块也会被识别为 API 路由；没有默认导出时，请求该路径可能返回 500。把 helper 移出路由目录，或给该路径显式返回 404。

本项目使用 Koa 3 和 `next-ssr-middleware`。ViNext 1.0 的 Pages API response shim 缺少 Koa 3 设置 `context.body` 时会调用的 `removeHeader`，导致正常 API 响应也变成 500。临时适配需要在 Koa handler 执行前补齐该方法，并操作 shim 的 header store；这是依赖当前 ViNext 实现细节的 workaround，升级 ViNext/Koa 后必须重新验证。项目当前封装位于 `pages/api/core.ts`。

其他 API 注意点：

- 使用 API route 的 `config.api.bodyParser: false` 时，确认 multipart、stream 或签名校验所需的原始请求体仍可读。
- Koa router 升级后检查 catch-all 语法；当前 `@koa/router` 常用形式为 `/{*path}`，旧通配写法可能无法注册。
- 本地没有 Lark App ID/Secret 时，相关页面、API 的认证请求会报配置错误。先补齐环境变量，再判断是否为迁移导致的 SSR 失败；API 返回 400/401/404/405 不等于框架 500。

## MDX 旁边的静态资源

webpack 的 `CopyWebpackPlugin` 不会随迁移继续工作。用 Vite 插件分别处理 development 和 build：

- `configureServer` 通过文件流服务 `/article/...` 图片、音频等资源，并设置正确 MIME type。
- `writeBundle` 只在 client 环境将文章资源复制到 client 输出目录。
- 解析路径后校验它仍位于文章资源根目录内，避免路径越界。
- build 后实际请求资源 URL；SSR 输出目录和浏览器静态资源目录不是一回事。

## 部署和平台差异

生产启动从 `next start` 改为 `vinext start`。Docker 镜像应复制 ViNext 的 `dist` 产物、运行所需依赖和 `public`，不要再依赖 `.next/standalone/server.js`。构建镜像和运行镜像应使用与项目 `engines.node` 匹配的 Node.js 主版本。

如果目标是 Cloudflare，另做平台 dry-run。迁移参考的 [ViNext issue #3582][6] 报告：ViNext 1.0 的 Cloudflare deploy 检测可能把所有 Pages Router `getStaticProps` 页面都判为 ISR，即使没有 `revalidate`，从而要求持久化 cache adapter。该 issue 针对 Cloudflare 部署检测，不应与普通本地 `vite dev`/`vite build` 混为一谈；部署前需核对 issue 状态和当前 adapter 版本。

## 验证清单

建议按以下顺序逐项通过：

```sh
pnpm exec vinext check
pnpm exec vinext typegen
pnpm build
pnpm exec tsc --noEmit
pnpm dev
```

然后按构建路由表逐一请求页面、动态路径、API 和文章静态资源。分类检查结果：

- 正常页面和资源应返回 200。
- 不存在的页面/资源应返回 404。
- 未授权、无效请求或上传请求缺少表单数据时，可能合法返回 400/401/405。
- 任何非预期的 500、dev server 编译失败、SSR 模块异常、浏览器 hydration 错误都要继续调查。

只看 HTTP 状态码还不够：在浏览器打开页面并检查 console、hydration 与交互；同一路由至少在 development 和 production server 各验证一次。给外部 API 配好测试凭据，避免把缺失配置导致的业务异常误判为框架问题。

## 本次验证记录

2026-10-01，在当前 GitHub codespaces 环境：

- `pnpm exec vinext check`：98% compatible；Sentry webpack/Turbopack 构建增强为 partial support。
- `pnpm build`：通过 `scripts/run-vite.mjs` 自动使用系统临时目录下的绝对 SWC 缓存路径，client 和 SSR 构建通过。
- `pnpm dev`：同一启动器成功启动 Vite，首页 smoke test 返回 200。
- `pnpm exec tsc --noEmit`：通过。
- 直接使用 SWC 默认缓存的 build 曾因 codespaces 缓存目录权限失败；系统临时目录 workaround 通过。

版本和环境变化后，应重新运行上述检查，不要将这次报告百分比或临时 workaround 视为长期保证。

[1]: https://github.com/cloudflare/vinext
[2]: https://vite.dev/blog/announcing-vite8
[3]: https://vite.dev/guide/api-plugin/
[4]: https://mdxjs.com/packages/rollup/
[5]: https://github.com/swc-project/swc/blob/main/docs/native-addon-carriers.md#L42-L50
[6]: https://github.com/cloudflare/vinext/issues/3582
