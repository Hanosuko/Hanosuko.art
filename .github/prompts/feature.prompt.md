---
description: Реализовать новую фичу на сайте Hanosuko.art
agent: agent
tools:
  - semantic_search
  - read_file
  - grep_search
  - file_search
  - run_in_terminal
  - agent
  - manage_todo_list
  - vscode/askQuestions
  - vscode/memory
---

# Feature Implementation

Сначала прочитай `/memories/repo/architecture.md` и `/memories/repo/api-contracts.md`.

## Workflow

1. **Понять** запрос. Если неоднозначно — задай 2-3 уточняющих вопроса.
2. **Исследовать** релевантную область кода через `Explore` subagent (если фича затрагивает несуществующие/неясные части).
3. **Предложить план** нумерованными шагами. Дождись подтверждения пользователя.
4. **Реализация**:
   - Любая UI/конфиг/интеграционная задача → делегируй `frontend-feature` агенту.
5. **Verify**: `npm run type-check` и `npm run build`.
6. **Резюме** буллетами что сделано. Спроси что дальше через askQuestions.

## Rules
- Точно соблюдай существующие паттерны (см. `instructions/vue-frontend.instructions.md`).
- Не добавляй фичи сверх запрошенного.
- Не меняй формат `src/config/profile.ts` без явного подтверждения.
- Обновляй `/memories/repo/architecture.md` и `/memories/repo/api-contracts.md`, если поменялась структура или контракты.
- Отвечай на русском.
