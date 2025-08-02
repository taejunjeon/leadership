-- Enable pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create grid3 schema for our application
CREATE SCHEMA IF NOT EXISTS grid3;

-- Set search path to include grid3 schema
ALTER DATABASE postgres SET search_path TO public, grid3;

-- Grant usage on grid3 schema to authenticated users
GRANT USAGE ON SCHEMA grid3 TO authenticated;
GRANT CREATE ON SCHEMA grid3 TO authenticated;