DROP INDEX IF EXISTS idx_summarizer_sessions_group_id;
ALTER TABLE summarizer_sessions DROP COLUMN IF EXISTS group_id;
