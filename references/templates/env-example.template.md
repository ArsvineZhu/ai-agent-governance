# .env.example 模板（生成到目标项目根目录）

INIT 时复制为 `<project>/.env.example`，替换 `{{...}}` 占位符；**只含占位符，绝不写入真实值**。按检测到的项目类型裁剪，未用到的区块直接删除（防虚构：不生成项目不存在的服务配置）。

```
# Environment template — copy to .env and fill in real values.
# NEVER commit real secrets. This file IS committed (placeholders only).

# {{APP_NAME}} configuration
APP_ENV=development
APP_PORT=3000

# Database (delete if unused)
DATABASE_URL=postgres://user:password@localhost:5432/{{APP_NAME}}

# Third-party services (delete unused blocks)
{{SERVICE_NAME}}_API_KEY=your_api_key_here
{{SERVICE_NAME}}_API_SECRET=your_secret_here

# AI / LLM services (delete if unused)
OPENAI_API_KEY=sk-your_key_here
ANTHROPIC_API_KEY=sk-ant-your_key_here
```

## 生成规则

- 每个真实密钥条目使用 `your_*_here` 占位，绝不写示例真实值
- 与 `.gitignore` 联动：`.env`、`.env.*` 必须被忽略（见 `references/policies/security.policy.md`）
- 按检测到的依赖（如 `pg`、`axios`、LLM SDK）裁剪区块；**未检测到的一律删除**