# Feature 文档模板（docs/features/<feature-name>.md）

**反虚构规则**：只给真实存在的功能建文档。

- 新项目无业务代码 → 只建 `_TEMPLATE.md`（本模板）+ `README.md`（说明"待业务模块确定后按模板逐个登记"），不建任何具体功能文档。
- 已有代码 → 逆推真实 Feature 文档，`Implementation` 路径必须与实际文件一致，严禁虚构路径。
- 暂缺字段标 `[PLACEHOLDER]` + `# TODO: 业务确定后填充`。

```markdown
# {{Feature Name}}

## Status
Experimental / Development / Production / Deprecated

## Purpose
{{为什么存在}}

## User Value
{{为用户提供什么价值}}

## Implementation
{{核心代码文件、核心模块、入口位置}}

## Dependencies
{{内部模块、外部库}}

## Related Documentation
{{ARCHITECTURE.md、DEVELOPMENT_PLAN.md、CHANGELOG.md 链接}}

## Tests
{{测试文件、验证方式}}

## Modification Rules
{{可以改什么、改前注意什么}}

## Removal Policy
{{删除前必须：确认替代方案、更新迁移说明、更新 CHANGELOG、更新 Status}}
```

## 登记规则

- 新增功能代码必须同时新增 Feature 文档；未登记的核心功能视为项目知识缺失。
- 结构变更（拆分/合并/删除功能）必须同步更新对应 Feature 文档与 `docs/ARCHITECTURE.md` 组件登记表。
