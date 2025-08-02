-- pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- UUID 생성 확장
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 기본 스키마 생성
CREATE SCHEMA IF NOT EXISTS grid3;