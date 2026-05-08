// Supabase table setup — run all SQL below in the Supabase SQL Editor:
// https://supabase.com/dashboard/project/citetlepqeioxegcdsad/sql/new
//
// ── 1. Create tables ──────────────────────────────────────────────────────────
//
// CREATE TABLE IF NOT EXISTS users (
//   id            BIGSERIAL PRIMARY KEY,
//   username      VARCHAR(191) NOT NULL UNIQUE,
//   email         VARCHAR(191) NOT NULL UNIQUE,
//   password      VARCHAR(255) NOT NULL,
//   full_name     VARCHAR(255) NOT NULL,
//   role          VARCHAR(50)  NOT NULL DEFAULT 'student',
//   avatar_url    VARCHAR(512),
//   phone_number  VARCHAR(32),
//   bio           TEXT
// );
//
// CREATE TABLE IF NOT EXISTS sessions (
//   id          BIGSERIAL PRIMARY KEY,
//   title       VARCHAR(255) NOT NULL,
//   description TEXT,
//   tutor_id    BIGINT NOT NULL,
//   student_id  BIGINT NOT NULL,
//   start_time  TIMESTAMPTZ NOT NULL,
//   end_time    TIMESTAMPTZ NOT NULL,
//   status      VARCHAR(32)  NOT NULL DEFAULT 'scheduled',
//   notes       TEXT
// );
//
// CREATE TABLE IF NOT EXISTS messages (
//   id          BIGSERIAL PRIMARY KEY,
//   content     TEXT NOT NULL,
//   sender_id   BIGINT NOT NULL,
//   receiver_id BIGINT NOT NULL,
//   timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//   read        BOOLEAN NOT NULL DEFAULT FALSE
// );
//
// CREATE TABLE IF NOT EXISTS documents (
//   id             BIGSERIAL PRIMARY KEY,
//   name           VARCHAR(255)  NOT NULL,
//   url            VARCHAR(1024) NOT NULL,
//   uploader_id    BIGINT NOT NULL,
//   shared_with_id BIGINT,
//   upload_time    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//   type           VARCHAR(255) NOT NULL,
//   size           BIGINT NOT NULL
// );
//
// ── 2. Disable RLS (required — server uses service_role key but belt-and-suspenders) ──
//
// ALTER TABLE users     DISABLE ROW LEVEL SECURITY;
// ALTER TABLE sessions  DISABLE ROW LEVEL SECURITY;
// ALTER TABLE messages  DISABLE ROW LEVEL SECURITY;
// ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
//
// ── 3. (Alternative) If you prefer to keep RLS enabled, add these policies ────
//
// CREATE POLICY "service_role_all" ON users     FOR ALL USING (true) WITH CHECK (true);
// CREATE POLICY "service_role_all" ON sessions  FOR ALL USING (true) WITH CHECK (true);
// CREATE POLICY "service_role_all" ON messages  FOR ALL USING (true) WITH CHECK (true);
// CREATE POLICY "service_role_all" ON documents FOR ALL USING (true) WITH CHECK (true);
export {};
