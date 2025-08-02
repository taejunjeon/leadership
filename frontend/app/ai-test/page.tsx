/**
 * AI Leadership 4Dx - AI Provider 테스트 페이지
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface AIProvider {
  provider: string;
  model: string;
  name: string;
  description: string;
}

interface AIAnalysisResult {
  strengths: string[];
  improvements: string[];
  action_plans: string[];
  expected_outcomes: string;
  ai_provider: string;
  ai_model: string;
}

export default function AITestPage() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [comparison, setComparison] = useState<any>(null);

  // AI Provider 목록 가져오기
  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/ai/providers`);
      if (response.ok) {
        const data = await response.json();
        setProviders(data);
        if (data.length > 0) {
          setSelectedProvider(data[0].provider);
        }
      }
    } catch (err) {
      setError('AI Provider 목록을 불러올 수 없습니다.');
    }
  };

  // 테스트 분석 실행
  const runAnalysis = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'test_user_001',
          ai_provider: selectedProvider,
          context: '한국 IT 기업 팀장'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || '분석 실행에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다. 백엔드가 실행 중인지 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  // AI 비교 분석
  const compareProviders = async () => {
    setLoading(true);
    setError('');
    setComparison(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/ai/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'test_user_001',
          context: '한국 IT 기업 팀장'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setComparison(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || '비교 분석에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Provider 테스트
          </h1>
          <p className="text-xl text-gray-600">
            GPT-4.1과 Claude 4 Sonnet의 리더십 분석 능력을 테스트하세요
          </p>
        </motion.div>

        {/* AI Provider 선택 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            AI 모델 선택
          </h2>
          
          {providers.length === 0 ? (
            <div className="text-gray-500">
              AI Provider를 불러오는 중...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {providers.map((provider) => (
                <label
                  key={provider.provider}
                  className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
                    selectedProvider === provider.provider
                      ? 'border-purple-600 ring-2 ring-purple-600'
                      : 'border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="ai-provider"
                    value={provider.provider}
                    checked={selectedProvider === provider.provider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex flex-1">
                    <div className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">
                        {provider.name}
                      </span>
                      <span className="mt-1 flex items-center text-sm text-gray-500">
                        {provider.model}
                      </span>
                      <span className="mt-2 text-sm text-gray-600">
                        {provider.description}
                      </span>
                    </div>
                  </div>
                  {selectedProvider === provider.provider && (
                    <CheckCircleIcon
                      className="h-5 w-5 text-purple-600"
                      aria-hidden="true"
                    />
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={runAnalysis}
            disabled={loading || !selectedProvider}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <ArrowPathIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
            ) : (
              <SparklesIcon className="-ml-1 mr-3 h-5 w-5" />
            )}
            {loading ? '분석 중...' : '분석 실행'}
          </button>

          <button
            onClick={compareProviders}
            disabled={loading || providers.length < 2}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            모델 비교 분석
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 분석 결과 */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI 분석 결과
              </h3>
              <p className="text-sm text-gray-600">
                모델: {result.ai_model} ({result.ai_provider})
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 강점 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">핵심 강점</h4>
                <ul className="space-y-2">
                  {result.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 개선 영역 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">개선 영역</h4>
                <ul className="space-y-2">
                  {result.improvements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start">
                      <ExclamationCircleIcon className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 실행 계획 */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">실행 계획</h4>
              <ol className="list-decimal list-inside space-y-2">
                {result.action_plans.map((plan, idx) => (
                  <li key={idx} className="text-gray-700">{plan}</li>
                ))}
              </ol>
            </div>

            {/* 예상 성과 */}
            {result.expected_outcomes && (
              <div className="mt-6 bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">예상 성과</h4>
                <p className="text-purple-700">{result.expected_outcomes}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* 비교 결과 */}
        {comparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-lg shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              AI 모델 비교 분석
            </h3>
            
            <div className="space-y-6">
              {Object.entries(comparison.comparison).map(([provider, data]: any) => (
                <div key={provider} className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 capitalize">
                    {provider === 'openai' ? 'GPT-4.1' : 'Claude 4 Sonnet'}
                  </h4>
                  
                  {data.error ? (
                    <p className="text-red-600">오류: {data.error}</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">강점 수:</p>
                        <p>{data.strengths?.length || 0}개</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">실행 계획 수:</p>
                        <p>{data.action_plans?.length || 0}개</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <p className="mt-4 text-sm text-gray-600 italic">
              {comparison.recommendation}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}