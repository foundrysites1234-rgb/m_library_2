# mlibrary Data & Storage Guide

## Static vs. Database-Stored Data

The twelve-volume catalogue (`src/content/books.js`), decades, genres, journal posts, page copy, and UI strings are bundled with the application because every volume is bound to fixed artwork crop boxes.

Only visitor submissions live in the database (`node:sqlite` locally via `DB_PATH`, or PostgreSQL in production via `DATABASE_URL`).

## Tables

### `contact_messages`

Stores general inquiries, book reservation requests (`topic = 'reserve'` with `book_id`), membership inquiries, book donation offers, and press inquiries (`status` is a legacy topic value kept in historical DB CHECK constraints and is no longer accepted by the API).

| Column | Type | Notes |
|---|---|---|
| `id` | Identity / Auto-increment integer | Primary key |
| `request_id` | `TEXT UNIQUE` | Client-generated UUID for idempotent submission |
| `full_name` | `TEXT` | **Personal data** (max 120 chars) |
| `email` | `TEXT` | **Personal data** (max 254 chars) |
| `phone` | `TEXT` (nullable) | **Personal data** (max 40 chars) |
| `topic` | `TEXT` | One of `general`, `reserve`, `membership`, `donate`, `press` (`status` is legacy and no longer accepted) |
| `book_id` | `TEXT` (nullable) | One of the 12 book IDs when `topic = 'reserve'` |
| `message` | `TEXT` | **Personal data** (max 2000 chars) |
| `consent_given` | `BOOLEAN` / `INTEGER` | Explicit consent flag required on submission |
| `status` | `TEXT` | Workflow state: `new`, `handled`, or `spam` |
| `created_at` | `TIMESTAMPTZ` / ISO 8601 `TEXT` | UTC creation timestamp |

### `newsletter_subscribers`

Stores email addresses subscribed through the Reading Letter footer form.

| Column | Type | Notes |
|---|---|---|
| `id` | Identity / Auto-increment integer | Primary key |
| `email` | `TEXT UNIQUE` | **Personal data** (lowercased, max 254 chars) |
| `locale` | `TEXT` | Active language at signup (`mn` or `en`) |
| `created_at` | `TIMESTAMPTZ` / ISO 8601 `TEXT` | UTC creation timestamp |

## Retention Policy (Placeholder)

- Delete `contact_messages` rows **24 months** after `created_at` unless needed for an active dispute or ongoing reservation record.
- Remove `newsletter_subscribers` rows immediately upon unsubscribe request.

## Accessing Submissions

There is no admin interface in this phase. In production (e.g. Supabase), row-level security (RLS) is enabled with no public policies so client API keys cannot read or write either table. The site owner reads and updates submissions directly in the Supabase Table Editor (or via a privileged database client).
