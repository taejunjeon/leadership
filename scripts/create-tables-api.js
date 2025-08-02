// Supabase API를 사용하여 테이블 생성
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eokkqmqpxqwmlmshhewn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVva2txbXFweHF3bWxtc2hoZXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzNDA5MDUsImV4cCI6MjA1MzkxNjkwNX0.ATO0vFq_9OIGr1nG7A-3hQs6lJ_I0i6GaGJQJOUu6S8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    // SQL 명령 실행을 위해서는 service role key가 필요하므로
    // 대신 테이블 존재 여부만 확인
    console.log('테이블 존재 여부 확인 중...');
    
    // survey_results 테이블 확인
    const { data: results, error: resultsError } = await supabase
      .from('survey_results')
      .select('id')
      .limit(1);
    
    if (resultsError) {
      console.log('survey_results 테이블이 존재하지 않습니다:', resultsError.message);
      console.log('\nSupabase 대시보드에서 다음 SQL을 실행하세요:\n');
      console.log(`-- 1. survey_results 테이블 생성
CREATE TABLE survey_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    completion_time INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. survey_responses 테이블 생성
CREATE TABLE survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    survey_id UUID NOT NULL REFERENCES survey_results(id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL,
    value INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS 정책 설정
ALTER TABLE survey_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- survey_results 정책
CREATE POLICY "Users can view own results" ON survey_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results" ON survey_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own results" ON survey_results
    FOR UPDATE USING (auth.uid() = user_id);

-- survey_responses 정책
CREATE POLICY "Users can manage own responses" ON survey_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM survey_results
            WHERE survey_results.id = survey_responses.survey_id
            AND survey_results.user_id = auth.uid()
        )
    );`);
    } else {
      console.log('✓ survey_results 테이블이 이미 존재합니다.');
    }
    
    // survey_responses 테이블 확인
    const { data: responses, error: responsesError } = await supabase
      .from('survey_responses')
      .select('id')
      .limit(1);
    
    if (responsesError) {
      console.log('survey_responses 테이블이 존재하지 않습니다:', responsesError.message);
    } else {
      console.log('✓ survey_responses 테이블이 이미 존재합니다.');
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

createTables();