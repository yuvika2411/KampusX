-- Applied to fresh databases after V1, and existing databases after baseline V1.
CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email_lower ON users (LOWER(email));
ALTER TABLE email_otps ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE email_otps ALTER COLUMN attempts SET DEFAULT 0;
ALTER TABLE email_otps ADD CONSTRAINT chk_email_otps_attempts_nonnegative CHECK (attempts >= 0);
