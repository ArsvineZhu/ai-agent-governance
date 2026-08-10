# CI Workflow 模板（按检测到的平台/栈选择）

管线统一包含：**安装依赖 → 格式检查 → 静态检查 → 类型检查 → 测试 → 构建 → 产物/报告上传**。平台未知 → ⚠️ Blocked 并询问用户。

## GitHub Actions — Node.js + pnpm（Vitest）

```yaml
name: CI
on:
  push:
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: latest
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist
```

## GitHub Actions — Python（pytest + ruff）

```yaml
name: CI
on:
  push:
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.11", "3.12"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
      - run: pip install -e ".[dev]"
      - run: ruff check .
      - run: mypy .
      - run: pytest -q
      - run: python -m build
      - uses: actions/upload-artifact@v4
        with:
          name: dist-${{ matrix.python-version }}
          path: dist
```

## GitLab CI（示例骨架）

```yaml
stages: [lint, test, build]
lint:
  stage: lint
  script: [...]
test:
  stage: test
  script: [...]
build:
  stage: build
  script: [...]
```

## 配套

- 若启用 GitHub：开启 **secret scanning** 与 **Dependabot**（`dependabot.yml`），并把治理校验作为门禁：

```yaml
# 可选：治理门禁 job
governance:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: node scripts/verify-governance.js
```
