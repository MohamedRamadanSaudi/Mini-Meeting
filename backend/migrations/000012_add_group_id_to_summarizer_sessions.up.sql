ALTER TABLE summarizer_sessions
    ADD COLUMN group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL;
CREATE INDEX idx_summarizer_sessions_group_id ON summarizer_sessions(group_id);
