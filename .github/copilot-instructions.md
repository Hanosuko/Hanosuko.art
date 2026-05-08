# GENERAL

## Memory System (CRITICAL)
- **ALWAYS** read `/memories/repo/` files at session start for full context:
  - `/memories/repo/architecture.md` — структура компонентов, модули, текущее состояние
  - `/memories/repo/build-run.md` — как поднять dev, собрать, задеплоить
  - `/memories/repo/api-contracts.md` — внешние API (cistiers, Discord avatar) и формат конфига профиля
  - `/memories/repo/issues-log.md` — прошлые баги и их исправления (проверяй до того, как начнёшь дебажить)
- **После фикса бага**: дописывай запись в `/memories/repo/issues-log.md`
- **После изменения архитектуры/структуры компонентов**: обновляй `/memories/repo/architecture.md`
- **После добавления/изменения скриптов сборки**: обновляй `/memories/repo/build-run.md`
- Записи в memory — короткие буллеты, без воды.

## Agent Delegation (CRITICAL)
Используй специализированных агентов для фичевой работы и ревью.

- **`frontend-feature`** — реализация UI на Vue 3 + TypeScript: компоненты, view, конфиг профиля, интеграция с внешними API (cistiers тиры, Discord avatar), стили, анимации иконок, аудио-плеер. Ключевые слова: компонент, страница, vue, ссылка, иконка, тир, аватар, конфиг, анимация, плеер.
- **`reviewer`** — запускать один раз в самом конце, после ручной проверки в браузере, прямо перед коммитом. Только чтение.
- **`Explore`** — многошаговые поиски по кодовой базе, сбор информации перед реализацией.

### Delegation Rules
- Любая UI/конфиг/интеграционная задача → делегируй `frontend-feature`.
- После реализации → ручная проверка в браузере → согласование с пользователем → `reviewer` один раз перед коммитом.
- Для исследования (как устроено, где что лежит) → `Explore` subagent.

## Workflow Rules — Interactive Collaboration (CRITICAL)

### Always Ask, Never Assume
- **ALWAYS** спрашивай пользователя перед решениями, влияющими на структуру компонентов, формат конфига или UX.
- **NEVER** молча продолжай при неоднозначной задаче — останавливайся и уточняй.
- **NEVER** додумывай требования к дизайну/функционалу — подтверждай у пользователя.
- Пользователь — продакт-оунер, финальные решения за ним.

### When to Ask
1. **Перед началом**: предложи 2-3 подхода, спроси какой.
2. **Во время реализации**: флагай любое design-решение (имена полей в конфиге, структура папок, цветовая схема).
3. **После реализации**: коротко резюмируй что сделано, спроси что дальше.
4. **При блокере**: объясни конфликт, спроси как поступить.
5. **Расширение скоупа**: если задача оказалась больше — подтверди расширение.

### Communication Format
- 1-3 фокусных вопроса за раз, не больше.
- Предлагай варианты: "Вариант A: ..., Вариант B: ..."
- Включай рекомендацию: "Рекомендую A, потому что..."
- **ALWAYS** используй askQuestions tool после завершения работы.
- **ALWAYS** заканчивай каждый завершённый ответ вызовом askQuestions, если пользователь не сказал «остановись».
- Формат askQuestions: 2-4 чётких опции с действием.

### Never Do Silently
- Не рефакторь код без запроса.
- Не добавляй фичи сверх того, что попросили.
- Не меняй формат конфига профиля без подтверждения.
- Не удаляй файлы и не вырезай функционал без явного одобрения.

## Language and Responses
- Комментарии в коде — английский. ИСКЛЮЧЕНИЕ: маркеры в `src/config/profile.ts` («измени здесь ник», «здесь меняй цвета») — на русском, чтобы пользователь сразу видел, где править.
- Отвечай пользователю на русском.

## Brand Rules
- Личный бренд: `Hanosuko`. Домен: `Hanosuko.art`. Пиши именно так (не `hanosuko`, не `HANOSUKO`).

## Code Style & Philosophy (Global)

### Self-Documenting Code (CRITICAL)
- **Zero Comments Policy**: код читается без комментариев. Комментарии — code smell.
  - **Исключение**: маркеры-указатели в `src/config/profile.ts` для пользователя.
- **Descriptive Naming**: длинные понятные имена вместо коротких загадочных.
- **Small, Focused Functions**: одна ответственность. Имя функции = что она делает.
- **Early Returns**: guard clauses, чтобы уменьшить вложенность.
- **No Docstrings**: для внутреннего кода не нужны.

## Build & Run

### Full Dev Stack
- Установить зависимости: `npm install`
- Dev сервер: `npm run dev` (Vite, обычно `http://localhost:5173`)
- Production сборка: `npm run build` (артефакты в `dist/`)
- Превью production билда: `npm run preview`
- Type-check: `npm run type-check` (vue-tsc)
- Lint: `npm run lint` (если настроен ESLint)

> Если каких-то скриптов ещё нет в `package.json` — добавляй и обновляй `/memories/repo/build-run.md`.

### Ports
- Vite dev: `5173`
- Vite preview: `4173`

### Dangerous Commands (NEVER run automatically)
- `rm -rf` любых директорий вне `node_modules/` и `dist/` — только с явным подтверждением.
- `git push --force`, `git push --force-with-lease` — только по прямой команде пользователя.
- `git reset --hard`, `git clean -fdx` — только с подтверждением.
- Любые команды, убивающие порты (`kill -9`, `lsof ... | xargs kill`) — спросить.
- Удаление `.env`, `package-lock.json`, `dist/` — спросить.
- Деплой/публикация на хостинг — только по явной команде.

# DOMAIN SECTIONS

## Frontend (Vue 3 + TypeScript + Vite)
Стек-специфичные правила в файлах-инструкциях, применяются автоматически:
- [Vue 3 + TS rules](instructions/vue-frontend.instructions.md) — applies to `src/**/*.{vue,ts}`

Подробные чек-листы реализации — в файле агента:
- [frontend-feature agent](agents/frontend-feature.agent.md)
