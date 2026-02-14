# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project Overview

AI-powered English tutor avatar for children (ages 5–9). The app provides conversational English practice through an animated avatar that speaks, listens, and adapts to the child's level — similar to Novakid but fully AI-driven. Primary user: a 7-year-old Hebrew-speaking girl learning English.

Stack: Next.js 14 (App Router), TypeScript, PostgreSQL via Prisma, Anthropic Claude API (conversation engine), ElevenLabs / OpenAI TTS (text-to-speech), Whisper / Deepgram (speech-to-text), deployed on Vercel.

## Architecture

```
/src
  /app                  — Pages and API routes (App Router)
    /(auth)             — Login/parent dashboard routes
    /(lesson)           — Lesson/conversation routes
    /api                — API route handlers (thin — delegate to services)
  /components
    /avatar             — Avatar display, animations, lip-sync
    /lesson             — Lesson UI, prompts, word cards, feedback
    /common             — Buttons, modals, loaders (child-friendly UI)
    /parent             — Parent dashboard, progress charts, settings
  /services
    /conversation.ts    — Core conversation engine (prompt building, turn management)
    /speech.ts          — TTS and STT integration
    /lesson-plan.ts     — Lesson generation, topic selection, difficulty scaling
    /progress.ts        — Track child's vocabulary, accuracy, streaks
    /safety.ts          — Content filtering, topic guardrails for child safety
  /lib
    /db.ts              — Prisma client singleton
    /ai.ts              — Anthropic SDK client and helpers
    /audio.ts           — Audio recording, playback, format utilities
    /types.ts           — Shared types (Lesson, Turn, ChildProfile, etc.)
    /constants.ts       — Difficulty levels, topic lists, age-appropriate vocab
    /errors.ts          — Typed error classes
    /logger.ts          — Structured logging
  /hooks
    /use-conversation.ts  — Manages conversation state and turn-taking
    /use-audio.ts         — Mic access, recording, playback
    /use-avatar.ts        — Avatar animation state
/prisma                 — Schema and migrations
/prompts                — System prompt templates (versioned, not hardcoded)
/public/assets          — Avatar images/sprites, sound effects, UI illustrations
```

## Key Data Models

```
Child       — id, name, age, native_language, current_level, parent_id
Lesson      — id, child_id, topic, difficulty, started_at, completed_at, score
Turn        — id, lesson_id, speaker (avatar|child), text, audio_url, timestamp
Vocabulary  — id, child_id, word, times_seen, times_correct, last_seen, mastered
Achievement — id, child_id, type, earned_at (streaks, milestones, badges)
```

---

# Child Safety — TOP PRIORITY

- This app is used by a 7-year-old. Every feature, prompt, and response MUST be child-safe.
- The AI must NEVER generate scary, violent, sexual, or emotionally manipulative content.
- All conversation prompts must include strict system-level guardrails (see `/prompts/`).
- The avatar must never ask for personal information (full name, address, school, etc.).
- If the child says something concerning (sad, scared, mentions harm), the avatar should respond kindly and notify the parent dashboard.
- All third-party API responses (TTS, STT) must be validated before reaching the child.
- No external links, ads, or user-generated content in the child-facing UI.
- Log all conversations for parent review. Parents can see full transcripts.

# Coding Rules

- Never put business logic in route handlers or components. Extract to `/src/services/`.
- One function, one job. If a function exceeds ~40 lines, split it.
- No barrel files (`index.ts` re-exports). Import directly from source files.
- Use named exports, not default exports (exception: pages and layouts).
- All DB queries go through `/src/lib/db.ts` — never import Prisma client directly elsewhere.
- All AI/LLM calls go through `/src/lib/ai.ts` — never call Anthropic SDK directly in components or routes.
- All prompt templates live in `/prompts/` as versioned `.ts` files — never hardcode prompts in services.
- Prefer flat data structures. Avoid nesting beyond 2 levels.

# Conversation Engine Rules

- Every conversation turn follows: Child speaks → STT → AI processes → Response text → TTS → Avatar speaks.
- Keep AI responses SHORT (1–3 sentences max). A 7-year-old won't listen to paragraphs.
- Use simple vocabulary appropriate to the child's current level. The AI must adapt dynamically.
- Always include encouragement. Never criticize or say "wrong." Use "Almost! Try this..." or "Great try! The word is...".
- Mix structured practice (vocabulary, sentence patterns) with free conversation. Aim for 70% guided / 30% free talk.
- Track every new word the child encounters. Don't introduce more than 3–5 new words per lesson.
- Repeat previously learned vocabulary naturally in new contexts (spaced repetition).
- If the child goes off-topic (normal for a 7-year-old), gently steer back after 1–2 fun exchanges.
- Support code-switching: if the child uses Hebrew, the avatar can acknowledge it and provide the English equivalent.

# Audio & Speech Rules

- STT must handle child speech patterns: mispronunciations, hesitations, background noise.
- Use a warm, friendly, slightly slow TTS voice. Not robotic. Not overly enthusiastic.
- Always provide a visual fallback (text/subtitles) alongside audio.
- Handle mic permission failures gracefully with a friendly message, not a technical error.
- Max recording time per turn: 30 seconds (prevent endless recordings).
- Audio files are stored temporarily and cleaned up after parent review window (30 days).

# Avatar & UI Rules

- The avatar must feel like a friendly character, not a teacher. Think "cartoon buddy."
- All animations must be smooth and non-jarring. No sudden movements or flashing.
- UI must be operable by a 7-year-old: large tap targets (min 48px), minimal text, visual cues.
- Use bright, warm colors. No dark themes for the child-facing UI.
- Loading states must be fun (avatar thinking animation), not spinners.
- The parent dashboard can use standard adult UI patterns.

# File Organization

- New feature → create `/src/services/[feature].ts` + `/src/components/[feature]/`.
- No file should exceed ~200 lines. Split into focused modules.
- Colocate tests: `foo.ts` → `foo.test.ts` in the same directory.
- Types live next to the code that uses them. Shared types go in `/src/lib/types.ts`.
- Max folder depth: 3 levels from `/src`.

# Naming Conventions

- Files: `kebab-case.ts` (e.g., `lesson-plan.ts`)
- Components: `PascalCase.tsx` (e.g., `AvatarDisplay.tsx`)
- Functions/variables: `camelCase`
- DB tables/columns: `snake_case`
- Booleans: prefix with `is`/`has`/`should` (e.g., `isSpeaking`, `hasCompletedLesson`)
- Prompt templates: `[context]-prompt.ts` (e.g., `vocabulary-prompt.ts`, `free-talk-prompt.ts`)
- Constants: `UPPER_SNAKE_CASE`

# Error Handling

- Use typed errors from `/src/lib/errors.ts`.
- Never show technical errors to the child. Show friendly messages: "Oops! Let's try again!" with a fun avatar animation.
- Parent dashboard can show detailed error info.
- If AI or TTS fails mid-lesson, gracefully fall back to a pre-recorded response or text-based mode.
- Log all errors with structured format: `logger.error({ context, childId, lessonId, action }, "message")`.
- API routes return consistent error shape: `{ error: { code: string, message: string } }`.

# Anti-Patterns — Do NOT:

- Hardcode prompts in service files. Always use `/prompts/` templates.
- Create generic `utils.ts` grab-bags. Be specific: `audio-utils.ts`, `text-formatters.ts`.
- Abstract "for the future." Only abstract with 3+ concrete uses.
- Store derived data (e.g., "words mastered count"). Compute from source of truth.
- Use `any` type. Use `unknown` and narrow, or define a proper type.
- Expose raw AI responses to the child without safety filtering through `safety.ts`.
- Add features to the child-facing UI without considering a 7-year-old's attention span.
- Over-engineer the lesson system early. Start with simple topic-based conversations, iterate from real usage.

# Commands

```bash
# Development
npm run dev

# Testing
npm run test              # Unit/integration tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report

# Code Quality
npm run lint              # ESLint + Prettier
npm run typecheck         # tsc --noEmit

# Database
npx prisma migrate dev    # Run migrations
npx prisma generate       # Regenerate client
npx prisma studio         # Visual DB browser
```

# Before Completing Any Task

1. Run `npm run typecheck` — fix all type errors.
2. Run tests for affected code — no regressions.
3. Run `npm run lint` — fix all lint issues.
4. Ask: "Is this safe and appropriate for a 7-year-old?"
5. Ask: "Would a 7-year-old understand this UI without help?"
6. Keep commits small and focused. One logical change per commit.

# Git Conventions

- Commit messages: `type: short description` (e.g., `feat: add vocabulary tracking`, `fix: handle mic permission denial gracefully`).
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
- Never commit `.env` files, API keys, or audio recordings.

# MVP Priorities

1. Core conversation loop: child speaks → avatar responds (even with basic TTS/STT).
2. Simple topic-based lessons (animals, colors, family, food).
3. Basic vocabulary tracking.
4. Parent dashboard with lesson history and transcripts.
5. Fun avatar with basic animations.
6. Achievement system (streaks, badges) to keep motivation high.
