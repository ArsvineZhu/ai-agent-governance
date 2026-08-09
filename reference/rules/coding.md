# 编码规范（Coding）

## 语言与风格

- 遵循项目既有代码风格与格式化配置（Formatter/Lint 配置为基准，不自定义风格）
- 命名：按语言惯例（camelCase / snake_case / PascalCase），保持一致
- 保持向后兼容；不因重构热情破坏公共接口

## 结构与依赖

- 遵循 docs/ARCHITECTURE.md 声明的目录结构，不随意改变
- 新模块/服务必须登记到组件登记表（New Code Registration）
- 加依赖必须用项目包管理器并说明用途；重型依赖需用户确认
- 不引入"看起来不错"但未被要求的抽象

## 修改已有代码

执行 Code Modification / Deletion Protection 四步：Context Analysis → Determine Code Ownership → Before Deletion → Breaking Changes（见 AGENTS.md 与 lifecycle.md）。

## 禁止

- 密钥/凭据硬编码
- 无关重构（scope creep）混入任务
- 删代码只因"看起来没用"（动态调用、插件、配置驱动代码需特别谨慎）
- 不更新知识就改代码
