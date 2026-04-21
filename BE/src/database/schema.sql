CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO roles (name)
VALUES
  ('guest'),
  ('member'),
  ('admin')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  username VARCHAR(40) UNIQUE,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  profile_image_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  banned_reason TEXT,
  banned_until TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (char_length(full_name) >= 3)
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  user_agent TEXT,
  ip_address VARCHAR(64),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brands (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(80) UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(60) UNIQUE NOT NULL,
  slug VARCHAR(70) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO categories (name, slug, description)
VALUES
  ('Smartphone', 'smartphone', 'Handheld phone devices'),
  ('Laptop', 'laptop', 'Portable personal computers'),
  ('Tablet', 'tablet', 'Touch screen tablet devices'),
  ('Accessory', 'accessory', 'Gadget accessories and peripherals')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS gadgets (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES categories(id),
  brand_id BIGINT NOT NULL REFERENCES brands(id),
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(180) UNIQUE NOT NULL,
  model VARCHAR(120),
  sku VARCHAR(80),
  release_date DATE,
  price NUMERIC(14, 2),
  stock INTEGER DEFAULT 0,
  currency_code CHAR(3) NOT NULL DEFAULT 'IDR',
  summary TEXT,
  description TEXT,
  average_rating NUMERIC(3, 2) NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_by BIGINT REFERENCES users(id),
  updated_by BIGINT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (price IS NULL OR price >= 0),
  CHECK (stock >= 0),
  CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE TABLE IF NOT EXISTS gadget_specs (
  id BIGSERIAL PRIMARY KEY,
  gadget_id BIGINT NOT NULL REFERENCES gadgets(id) ON DELETE CASCADE,
  spec_group VARCHAR(60),
  spec_key VARCHAR(100) NOT NULL,
  spec_value TEXT NOT NULL,
  value_type VARCHAR(20) NOT NULL DEFAULT 'text',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (value_type IN ('text', 'number', 'boolean', 'json'))
);

CREATE TABLE IF NOT EXISTS gadget_media (
  id BIGSERIAL PRIMARY KEY,
  gadget_id BIGINT NOT NULL REFERENCES gadgets(id) ON DELETE CASCADE,
  media_type VARCHAR(20) NOT NULL DEFAULT 'image',
  file_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (media_type IN ('image', 'video'))
);

CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  gadget_id BIGINT NOT NULL REFERENCES gadgets(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_review_id BIGINT REFERENCES reviews(id) ON DELETE CASCADE,
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(160),
  review_text TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  upvote_count INTEGER NOT NULL DEFAULT 0,
  downvote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    (parent_review_id IS NULL AND rating IS NOT NULL)
    OR (parent_review_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS review_media (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  caption VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_votes (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (review_id, user_id)
);

CREATE TABLE IF NOT EXISTS review_reports (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  reporter_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason_code VARCHAR(40) NOT NULL,
  reason_text TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  handled_by BIGINT REFERENCES users(id),
  handled_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  CHECK (status IN ('pending', 'reviewed', 'rejected', 'resolved'))
);

CREATE TABLE IF NOT EXISTS saved_gadgets (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gadget_id BIGINT NOT NULL REFERENCES gadgets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, gadget_id)
);

CREATE TABLE IF NOT EXISTS comparison_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(120),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comparison_items (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES comparison_sessions(id) ON DELETE CASCADE,
  gadget_id BIGINT NOT NULL REFERENCES gadgets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (session_id, gadget_id)
);

CREATE TABLE IF NOT EXISTS user_activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(60) NOT NULL,
  entity_type VARCHAR(60),
  entity_id BIGINT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_action_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(80) NOT NULL,
  target_entity_type VARCHAR(80),
  target_entity_id BIGINT,
  note TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE roles
  ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username VARCHAR(40),
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS banned_reason TEXT,
  ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE gadgets
  ADD COLUMN IF NOT EXISTS category_id BIGINT REFERENCES categories(id),
  ADD COLUMN IF NOT EXISTS brand_id BIGINT REFERENCES brands(id),
  ADD COLUMN IF NOT EXISTS slug VARCHAR(180),
  ADD COLUMN IF NOT EXISTS model VARCHAR(120),
  ADD COLUMN IF NOT EXISTS sku VARCHAR(80),
  ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency_code CHAR(3) DEFAULT 'IDR',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS created_by BIGINT REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS updated_by BIGINT REFERENCES users(id);

UPDATE gadgets
SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || id
WHERE slug IS NULL OR slug = '';

ALTER TABLE gadgets
  ALTER COLUMN slug SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'gadgets_status_check'
      AND conrelid = 'gadgets'::regclass
  ) THEN
    ALTER TABLE gadgets
      ADD CONSTRAINT gadgets_status_check CHECK (status IN ('draft', 'published', 'archived'));
  END IF;
END;
$$;

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS parent_review_id BIGINT REFERENCES reviews(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS title VARCHAR(160),
  ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS upvote_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS downvote_count INTEGER DEFAULT 0;

ALTER TABLE reviews
  ALTER COLUMN rating DROP NOT NULL;

ALTER TABLE reviews
  DROP CONSTRAINT IF EXISTS reviews_gadget_id_user_id_key;

ALTER TABLE review_votes
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE review_reports
  ADD COLUMN IF NOT EXISTS reporter_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS reason_code VARCHAR(40),
  ADD COLUMN IF NOT EXISTS handled_by BIGINT REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS handled_note TEXT;

UPDATE review_reports
SET reporter_user_id = user_id
WHERE reporter_user_id IS NULL;

UPDATE review_reports
SET reason_code = 'other'
WHERE reason_code IS NULL OR reason_code = '';

ALTER TABLE review_reports
  ALTER COLUMN reporter_user_id SET NOT NULL,
  ALTER COLUMN reason_code SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'review_reports_status_check'
      AND conrelid = 'review_reports'::regclass
  ) THEN
    ALTER TABLE review_reports
      ADD CONSTRAINT review_reports_status_check CHECK (status IN ('pending', 'reviewed', 'rejected', 'resolved'));
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION refresh_gadget_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  target_gadget_id BIGINT;
BEGIN
  target_gadget_id := COALESCE(NEW.gadget_id, OLD.gadget_id);

  UPDATE gadgets g
  SET
    average_rating = COALESCE(sub.avg_rating, 0),
    total_reviews = COALESCE(sub.total_reviews, 0),
    updated_at = NOW()
  FROM (
    SELECT
      gadget_id,
      ROUND(AVG(rating)::numeric, 2) AS avg_rating,
      COUNT(*)::integer AS total_reviews
    FROM reviews
    WHERE gadget_id = target_gadget_id
      AND parent_review_id IS NULL
      AND is_deleted = FALSE
      AND rating IS NOT NULL
    GROUP BY gadget_id
  ) sub
  WHERE g.id = target_gadget_id;

  UPDATE gadgets
  SET
    average_rating = 0,
    total_reviews = 0,
    updated_at = NOW()
  WHERE id = target_gadget_id
    AND NOT EXISTS (
      SELECT 1
      FROM reviews
      WHERE gadget_id = target_gadget_id
        AND parent_review_id IS NULL
        AND is_deleted = FALSE
        AND rating IS NOT NULL
    );

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_brands_updated_at ON brands;
CREATE TRIGGER trg_brands_updated_at
BEFORE UPDATE ON brands
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_gadgets_updated_at ON gadgets;
CREATE TRIGGER trg_gadgets_updated_at
BEFORE UPDATE ON gadgets
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_gadget_specs_updated_at ON gadget_specs;
CREATE TRIGGER trg_gadget_specs_updated_at
BEFORE UPDATE ON gadget_specs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON reviews;
CREATE TRIGGER trg_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_review_votes_updated_at ON review_votes;
CREATE TRIGGER trg_review_votes_updated_at
BEFORE UPDATE ON review_votes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_comparison_sessions_updated_at ON comparison_sessions;
CREATE TRIGGER trg_comparison_sessions_updated_at
BEFORE UPDATE ON comparison_sessions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_refresh_rating_after_review_insert ON reviews;
CREATE TRIGGER trg_refresh_rating_after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION refresh_gadget_rating();

DROP TRIGGER IF EXISTS trg_refresh_rating_after_review_update ON reviews;
CREATE TRIGGER trg_refresh_rating_after_review_update
AFTER UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION refresh_gadget_rating();

DROP TRIGGER IF EXISTS trg_refresh_rating_after_review_delete ON reviews;
CREATE TRIGGER trg_refresh_rating_after_review_delete
AFTER DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION refresh_gadget_rating();

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_gadgets_category_id ON gadgets(category_id);
CREATE INDEX IF NOT EXISTS idx_gadgets_brand_id ON gadgets(brand_id);
CREATE INDEX IF NOT EXISTS idx_gadgets_slug ON gadgets(slug);
CREATE INDEX IF NOT EXISTS idx_gadget_specs_gadget_id ON gadget_specs(gadget_id);
CREATE INDEX IF NOT EXISTS idx_reviews_gadget_id ON reviews(gadget_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_parent_review_id ON reviews(parent_review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON review_reports(status);
CREATE INDEX IF NOT EXISTS idx_review_reports_review_id ON review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_saved_gadgets_user_id ON saved_gadgets(user_id);
CREATE INDEX IF NOT EXISTS idx_comparison_sessions_user_id ON comparison_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_admin_user_id ON admin_action_logs(admin_user_id);
