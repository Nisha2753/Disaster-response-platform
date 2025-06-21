-- Table: disasters
CREATE TABLE IF NOT EXISTS disasters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  description TEXT,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified BOOLEAN DEFAULT FALSE
);

-- Table: resources (e.g., shelters, hospitals, aid)
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: updates (field reports, status updates)
CREATE TABLE IF NOT EXISTS updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  reported_by TEXT,
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified BOOLEAN DEFAULT FALSE
);

-- Table: verifications (LLM or human-reviewed items)
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT CHECK (target_type IN ('disaster', 'resource', 'update')),
  target_id UUID NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at TIMESTAMP
);

-- Optional: create index for fast geo queries
CREATE INDEX IF NOT EXISTS idx_disaster_location ON disasters USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_resource_location ON resources USING GIST (location);
