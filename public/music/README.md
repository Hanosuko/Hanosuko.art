Положи сюда mp3/ogg/wav/m4a/flac/opus файлы — они автоматически появятся в плеере на сайте.

Имя файла → название трека (подчёркивания и дефисы заменяются на пробелы).

Vite плагин `hanosuko:music-manifest` (см. `vite-plugins/music-manifest.ts`) сканирует эту папку
и генерирует `manifest.json` при старте dev-сервера и при `npm run build`.
В dev режиме добавление/удаление файла триггерит full reload.
