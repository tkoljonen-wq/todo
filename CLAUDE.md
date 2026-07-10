# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This is a single-file PWA todo app. Everything lives in two files:

- **`index.html`** — the entire app: HTML structure, CSS styles, and JavaScript logic all inline
- **`sw.js`** — service worker for offline caching (network first, cache fallback)

There is no build step, no dependencies, no package manager. Open `index.html` directly in a browser to run.

## Data model

Tasks are stored in `localStorage` under the key `todo_v2` as `{ civil: Task[], work: Task[] }`.

Each task: `{ id, text, due, dueTime, done, created }`

On every save, data is also POSTed to a Google Apps Script URL (`APPS_SCRIPT_URL` in the JS) for Sheets sync.

## Key JS sections (all in index.html `<script>`)

- **DATA** — `load()`, `save()`, `syncToSheets()`
- **VOICE** — Web Speech API (Finnish `fi-FI`), push-to-talk via `startMic`/`stopMic`
- **SAVE** — `saveTask(list)` adds to `data[list]`
- **EDIT** — `startEdit`, `saveEdit`, `cancelEdit` with `editingId` global tracking the active edit
- **RENDER** — `renderList(name)` rebuilds the DOM for one column; `render()` calls both
- **TASK ACTIONS** — `toggleDone`, `deleteTask`, `clearDone`
- **GOOGLE CALENDAR** — `addToGoogleCalendar(task)` opens Google Calendar new-event URL

## UI layout

Two-column grid (`work` left, `civil` right). On mobile (<600px) stacks to single column. Tasks are rendered imperatively — `render()` always rebuilds the full list from `data`.

## Language

UI text is in Finnish. Field labels, toast messages, and button text should remain in Finnish.
