---
description: Быстрый багфикс на сайте Hanosuko.art
agent: agent
tools:
  - semantic_search
  - read_file
  - grep_search
  - file_search
  - run_in_terminal
  - replace_string_in_file
  - multi_replace_string_in_file
  - get_errors
  - vscode/memory
  - vscode/askQuestions
---

# Hotfix

## Workflow

1. **Прочитай** `/memories/repo/issues-log.md` — проверь, не фиксили ли уже этот баг или похожий паттерн.
2. **Диагностика** root cause. Прочитай релевантные файлы, проверь консоль браузера / Vite output, если применимо.
3. **Фикс** минимальными изменениями. Не рефактори окружающий код.
4. **Verify**: `npm run type-check`, `npm run build`. При нужде — открой dev-сервер и проверь визуально.
5. **Обнови** `/memories/repo/issues-log.md`:
   ```
   ## Короткое описание (YYYY-MM-DD)
   - Problem: ...
   - Root cause: ...
   - Fix: ...
   ```
6. **Резюме** фикса и спроси что дальше через askQuestions.

## Rules
- Один фикс за вызов. Не чини попутно несвязанные баги.
- Если фикс затрагивает формат `Profile` или контракт внешнего API — флагай и спроси перед внесением.
- Отвечай на русском.
