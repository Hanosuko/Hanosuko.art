---
description: Code review перед коммитом
agent: agent
tools:
  - agent
  - run_in_terminal
  - get_errors
  - vscode/memory
  - vscode/askQuestions
---

# Pre-Commit Review

## Workflow

1. **Build**: `npm run type-check` + `npm run build`.
2. **Lint** (если настроен): `npm run lint`.
3. **Делегируй** `reviewer` агенту со списком изменённых файлов.
4. **Отчёт** по серьёзности: CRITICAL → HIGH → MEDIUM → LOW.
5. Если есть issues — спроси, фиксить сейчас или пропустить.
6. Если чисто — предложи commit message в conventional commits с scope (`feat(tiers): ...`, `fix(audio-player): ...`, `chore(config): ...`).

## Rules
- Read-only ревью. Не модифицируй файлы без явной просьбы пользователя пофиксить.
- Фокус на: нарушения паттернов, security (OWASP, особенно XSS и небезопасные ссылки), error handling в fetch, отсутствие fallback'ов, утечки секретов в bundle.
- Не флагай вкусовщину, если стиль консистентен.
- Отвечай на русском.
