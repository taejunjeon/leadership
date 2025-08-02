/**
 * AI Leadership 4Dx - AI 분석 결과 페이지
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  UserIcon, 
  SparklesIcon,
  DocumentTextIcon,
  CubeIcon,
  ArrowLeftIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';

interface AnalysisResult {
  blakeMouseton: {
    people: number;
    production: number;
    style: string;
  };
  radicalCandor: {
    care: number;
    challenge: number;
    quadrant: string;
  };
  lmx: {
    score: number;
    level: string;
  };
  aiInsights: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  };
}

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const surveyId = params.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }

    if (user && surveyId) {
      loadAnalysis();
    }
  }, [user, authLoading, surveyId, router]);

  const loadAnalysis = async () => {
    try {
      let responses: any[] = [];
      
      // 임시 ID인 경우 로컬 스토리지에서 가져오기
      if (surveyId.startsWith('temp_')) {
        const localData = localStorage.getItem(`survey_${surveyId}`);
        if (localData) {
          const parsedData = JSON.parse(localData);
          responses = parsedData.responses.map((r: any) => ({
            question_id: r.questionId,
            value: r.value
          }));
          console.log('로컬 스토리지에서 데이터 로드:', responses.length);
        }
      } else {
        // Supabase에서 데이터 가져오기
        const { data: dbResponses, error: responseError } = await supabase
          .from('survey_responses')
          .select('*')
          .eq('survey_id', surveyId);

        if (responseError) throw responseError;
        responses = dbResponses || [];
      }

      if (!responses || responses.length === 0) {
        setError('설문 결과를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      // 분석 수행
      const analysisResult = analyzeResponses(responses);
      setAnalysis(analysisResult);
      
      // AI 인사이트 생성 (백엔드 API 호출 시뮬레이션)
      const aiInsights = await generateAIInsights(analysisResult);
      setAnalysis(prev => ({
        ...prev!,
        aiInsights
      }));

    } catch (err) {
      console.error('Analysis error:', err);
      setError('분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeResponses = (responses: any[]): AnalysisResult => {
    // Blake-Mouton 분석 (문항 1-14)
    const peopleQuestions = [1, 3, 5, 7, 9, 11, 13];
    const productionQuestions = [2, 4, 6, 8, 10, 12, 14];
    
    const peopleScore = calculateAverage(responses, peopleQuestions);
    const productionScore = calculateAverage(responses, productionQuestions);
    
    const blakeMousetonStyle = getBlakeMousetonStyle(peopleScore, productionScore);

    // Radical Candor 분석 (문항 15-24)
    const careQuestions = [15, 17, 19, 21, 23];
    const challengeQuestions = [16, 18, 20, 22, 24];
    
    const careScore = calculateAverage(responses, careQuestions);
    const challengeScore = calculateAverage(responses, challengeQuestions);
    
    const radicalCandorQuadrant = getRadicalCandorQuadrant(careScore, challengeScore);

    // LMX 분석 (문항 25-34)
    const lmxQuestions = Array.from({length: 10}, (_, i) => i + 25);
    const lmxScore = calculateAverage(responses, lmxQuestions);
    const lmxLevel = getLMXLevel(lmxScore);

    return {
      blakeMouseton: {
        people: peopleScore,
        production: productionScore,
        style: blakeMousetonStyle
      },
      radicalCandor: {
        care: careScore,
        challenge: challengeScore,
        quadrant: radicalCandorQuadrant
      },
      lmx: {
        score: lmxScore,
        level: lmxLevel
      },
      aiInsights: {
        strengths: [],
        improvements: [],
        recommendations: []
      }
    };
  };

  const calculateAverage = (responses: any[], questionIds: number[]): number => {
    const relevantResponses = responses.filter(r => 
      questionIds.includes(parseInt(r.question_id.split('_')[1]))
    );
    
    if (relevantResponses.length === 0) return 0;
    
    const sum = relevantResponses.reduce((acc, r) => acc + r.value, 0);
    return sum / relevantResponses.length;
  };

  const getBlakeMousetonStyle = (people: number, production: number): string => {
    if (people >= 6 && production >= 6) return '팀 관리형 (Team Management)';
    if (people >= 6 && production < 6) return '인간 중심형 (Country Club)';
    if (people < 6 && production >= 6) return '권위 순응형 (Authority-Compliance)';
    if (people >= 4 && production >= 4) return '중도 관리형 (Middle-of-the-Road)';
    return '무관심형 (Impoverished)';
  };

  const getRadicalCandorQuadrant = (care: number, challenge: number): string => {
    if (care >= 4 && challenge >= 4) return 'Radical Candor (진정한 배려)';
    if (care >= 4 && challenge < 4) return 'Ruinous Empathy (파괴적 공감)';
    if (care < 4 && challenge >= 4) return 'Obnoxious Aggression (불쾌한 공격)';
    return 'Manipulative Insincerity (교묘한 불성실)';
  };

  const getLMXLevel = (score: number): string => {
    if (score >= 6) return '높음 (High-Quality Exchange)';
    if (score >= 4) return '중간 (Medium-Quality Exchange)';
    return '낮음 (Low-Quality Exchange)';
  };

  const generateAIInsights = async (analysis: AnalysisResult): Promise<any> => {
    // 실제로는 백엔드 API를 호출하지만, 지금은 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const strengths = [];
    const improvements = [];
    const recommendations = [];

    // Blake-Mouton 기반 인사이트
    if (analysis.blakeMouseton.people >= 6 && analysis.blakeMouseton.production >= 6) {
      strengths.push('팀원의 성장과 성과를 균형있게 추구하는 이상적인 리더십 스타일을 보이고 있습니다.');
      recommendations.push('현재의 균형잡힌 리더십을 유지하면서, 상황에 따른 유연성을 더욱 강화하세요.');
    } else if (analysis.blakeMouseton.people >= 6) {
      strengths.push('팀원들과의 관계 형성과 팀 분위기 조성에 뛰어난 역량을 보입니다.');
      improvements.push('성과 지향성을 높여 팀의 목표 달성률을 개선할 필요가 있습니다.');
      recommendations.push('명확한 목표 설정과 성과 측정 체계를 도입하여 결과 중심의 문화를 강화하세요.');
    } else if (analysis.blakeMouseton.production >= 6) {
      strengths.push('목표 달성과 성과 창출에 강한 추진력을 보입니다.');
      improvements.push('팀원들의 정서적 니즈와 개인적 성장에 더 많은 관심을 기울일 필요가 있습니다.');
      recommendations.push('1:1 면담을 정기적으로 실시하고 팀원들의 피드백을 적극적으로 수용하세요.');
    }

    // Radical Candor 기반 인사이트
    if (analysis.radicalCandor.quadrant === 'Radical Candor (진정한 배려)') {
      strengths.push('직접적이면서도 배려깊은 피드백으로 팀원들의 성장을 효과적으로 지원합니다.');
    } else if (analysis.radicalCandor.quadrant === 'Ruinous Empathy (파괴적 공감)') {
      improvements.push('때로는 불편하더라도 솔직한 피드백을 제공하는 용기가 필요합니다.');
      recommendations.push('구체적이고 건설적인 피드백 기법을 연습하고, 팀원의 성장을 위해 필요한 조언을 주저하지 마세요.');
    }

    // LMX 기반 인사이트
    if (analysis.lmx.level === '높음 (High-Quality Exchange)') {
      strengths.push('팀원들과 높은 신뢰 관계를 구축하여 효과적인 협업 환경을 조성합니다.');
    } else if (analysis.lmx.level === '낮음 (Low-Quality Exchange)') {
      improvements.push('팀원들과의 신뢰 관계 구축에 더 많은 시간과 노력을 투자해야 합니다.');
      recommendations.push('정기적인 팀 빌딩 활동과 개방적인 소통 채널을 만들어 관계의 질을 높이세요.');
    }

    return { strengths, improvements, recommendations };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-medium text-gray-700">AI 분석 중...</h1>
          <p className="text-gray-500 mt-2">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-medium text-red-600 mb-4">{error}</h1>
          <button
            onClick={() => router.push('/survey')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            새로운 설문 시작하기
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            뒤로 가기
          </button>
          
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI 리더십 분석 결과</h1>
          </div>
          <p className="mt-2 text-gray-600">
            귀하의 리더십 스타일에 대한 종합적인 분석 결과입니다
          </p>
        </div>

        {/* 주요 지표 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Blake-Mouton 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Blake-Mouton Grid</h3>
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">사람 지향</span>
                  <span className="text-sm font-medium">{analysis.blakeMouseton.people.toFixed(1)}/7</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(analysis.blakeMouseton.people / 7) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">성과 지향</span>
                  <span className="text-sm font-medium">{analysis.blakeMouseton.production.toFixed(1)}/7</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(analysis.blakeMouseton.production / 7) * 100}%` }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm font-medium text-gray-900">{analysis.blakeMouseton.style}</p>
              </div>
            </div>
          </motion.div>

          {/* Radical Candor 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Radical Candor</h3>
              <UserIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">배려 (Care)</span>
                  <span className="text-sm font-medium">{analysis.radicalCandor.care.toFixed(1)}/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(analysis.radicalCandor.care / 5) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">도전 (Challenge)</span>
                  <span className="text-sm font-medium">{analysis.radicalCandor.challenge.toFixed(1)}/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(analysis.radicalCandor.challenge / 5) * 100}%` }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm font-medium text-gray-900">{analysis.radicalCandor.quadrant}</p>
              </div>
            </div>
          </motion.div>

          {/* LMX 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">LMX (관계 품질)</h3>
              <CubeIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">관계 품질 점수</span>
                  <span className="text-sm font-medium">{analysis.lmx.score.toFixed(1)}/7</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(analysis.lmx.score / 7) * 100}%` }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm font-medium text-gray-900">{analysis.lmx.level}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* AI 인사이트 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <SparklesIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">AI 인사이트</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 강점 */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">강점</h3>
              <ul className="space-y-2">
                {analysis.aiInsights.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span className="text-sm text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 개선 영역 */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">개선 영역</h3>
              <ul className="space-y-2">
                {analysis.aiInsights.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span className="text-sm text-gray-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 추천 사항 */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">추천 사항</h3>
              <ul className="space-y-2">
                {analysis.aiInsights.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span className="text-sm text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* 액션 버튼 */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href={`/visualization?surveyId=${surveyId}`}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <CubeIcon className="w-5 h-5" />
            3D 시각화 보기
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <DocumentTextIcon className="w-5 h-5" />
            보고서 출력
          </button>
        </div>
      </div>
    </div>
  );
}