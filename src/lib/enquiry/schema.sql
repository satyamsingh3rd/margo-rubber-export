-- ═══════════════════════════════════════════════════════════════════════════
-- ENQUIRIES
--
-- The system of record for every enquiry the website receives.
--
-- This table exists so that lead history does not live inside whichever CRM is
-- current. A CRM is a working tool and may be swapped on usability grounds;
-- the record of who enquired, when, and what they wanted has to outlive that.
-- Everything lands here first and is pushed outward from here.
--
-- Run once against the Neon database:
--   psql "$DATABASE_URL" -f src/lib/enquiry/schema.sql
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS enquiries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),

  -- Which form, and where from. `page` is what lets the dashboard answer
  -- "which pages produce enquiries", which neither GA4 nor a CRM can.
  source        text        NOT NULL,
  page          text        NOT NULL,
  referrer      text,
  user_agent    text,

  -- Canonical columns. Every form maps its own field names onto these; see
  -- FIELD_MAP in src/lib/enquiry/sources.ts.
  name          text,
  company       text,
  email         text        NOT NULL,
  phone         text,
  country       text,
  product       text,
  quantity      text,
  message       text,

  -- R2 object URL for an attached drawing. Null when none was uploaded.
  file_url      text,

  status        text        NOT NULL DEFAULT 'new',

  -- Whichever CRM is connected. `crm_synced_at` being null is what makes a
  -- failed webhook delivery visible instead of silent, and gives the dashboard
  -- a retry list.
  crm_id        text,
  crm_synced_at timestamptz,

  -- The complete submitted payload, verbatim.
  --
  -- Deliberate: the columns above cover what is known today, but a field added
  -- to a form next year would otherwise be lost between the day it ships and
  -- the day someone adds a column. Keeping the raw body means it is captured
  -- from the first submission and can be promoted to a column later without a
  -- gap in the history.
  raw           jsonb       NOT NULL,

  CONSTRAINT enquiries_status_check
    CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost'))
);

-- Dashboard default view: newest first.
CREATE INDEX IF NOT EXISTS enquiries_created_at_idx
  ON enquiries (created_at DESC);

-- Dashboard filters, and the scheduled-automation query
-- (GET /api/enquiries?status=new&olderThan=3d).
CREATE INDEX IF NOT EXISTS enquiries_status_created_idx
  ON enquiries (status, created_at DESC);

-- "Which pages produce enquiries", grouped.
CREATE INDEX IF NOT EXISTS enquiries_page_idx
  ON enquiries (page);

-- Finding the unsynced ones to retry. Partial, because the rows that matter
-- are the few that failed, not the many that worked.
CREATE INDEX IF NOT EXISTS enquiries_unsynced_idx
  ON enquiries (created_at DESC)
  WHERE crm_synced_at IS NULL;
