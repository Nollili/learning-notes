-- Integration schema; app_user is supplied by the chosen authentication integration.
CREATE TABLE app_session (
  token_hash text PRIMARY KEY CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  user_id uuid NOT NULL REFERENCES app_user(id),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz
);
CREATE TABLE private_note (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES app_user(id),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0)
);
CREATE INDEX private_note_owner_idx ON private_note(owner_id);
