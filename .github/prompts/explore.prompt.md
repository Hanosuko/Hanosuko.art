---
description: Исследовать кодовую базу или разобраться в вопросе
agent: agent
tools:
  - agent
  - semantic_search
  - read_file
  - grep_search
  - file_search
  - list_dir
  - fetch_webpage
  - vscode/memory
  - vscode/askQuestions
---

# Explore & Research

Делегируй `Explore` subagent с уровнем глубины по сложности вопроса:
- Простой lookup → quick
- Понять flow / как работает фича → medium
- Архитектурное исследование → thorough

После результата — короткое резюме с ссылками на релевантные файлы.

Если узнал что-то полезное на будущее — обнови соответствующий файл в `/memories/repo/` (`architecture.md`, `api-contracts.md`, `issues-log.md`).

Отвечай на русском.
