-- Initialize the ToggleFlow database
-- This script runs automatically when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE toggleflow TO toggleflow;

-- Log initialization
DO $$
BEGIN
  RAISE NOTICE 'ToggleFlow database initialized successfully';
END $$;
