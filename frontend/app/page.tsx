/**
 * AI Leadership 4Dx - 홈페이지
 */

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  DocumentCheckIcon, 
  CubeIcon,
  UserGroupIcon 
} from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI Leadership 4Dx
          </h1>
          <p className="text-xl text-gray-600">
            4차원 리더십 진단 및 분석 플랫폼
          </p>
        </motion.div>

        {/* Grid 3.0 플랫폼 소개 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Grid 3.0 리더십 매핑 플랫폼 소개
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-4 text-lg">
              <span className="font-semibold text-blue-600">환영합니다!</span> Grid 3.0은 스타트업의 리더십을 혁신적으로 진단하고 코칭하는 플랫폼입니다.
            </p>
            
            <p className="mb-6 leading-relaxed">
              빠르게 성장하는 스타트업 환경에서 리더십 혁신을 실시간으로 파악하세요. 이 플랫폼은{' '}
              <span className="text-blue-600 font-medium">Blake-Mouton Managerial Grid</span>(사람 지향 vs. 성과 지향),{' '}
              <span className="text-purple-600 font-medium">Radical Candor</span>(배려와 솔직한 피드백 균형),{' '}
              <span className="text-green-600 font-medium">LMX</span>(리더-팀원 관계 질) 세 가지 핵심 이론을 통합한 
              4D 매핑 시스템을 기반으로 합니다.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <p className="mb-0 text-gray-800">
                간단한 설문(<span className="font-semibold">총 43문항</span>: Grid 14문항 + Candor 10문항 + LMX 10문항 + Influence 9문항)을 통해 
                리더의 강점과 개선점을 3D 대시보드에 시각화하고, AI 기반 코칭 카드를 제공합니다.
              </p>
            </div>
            
            <div className="flex justify-center gap-4">
              <Link
                href="/survey"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                설문 시작하기
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                자세히 알아보기
              </Link>
            </div>
          </div>
        </motion.div>

        {/* 주요 기능 카드 */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <DocumentCheckIcon className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">설문 검증</h3>
            <p className="text-gray-600 mb-4">실시간 데이터 검증 및 이상치 감지</p>
            <Link
              href="/survey"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              설문 시작 →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <ChartBarIcon className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">검증 대시보드</h3>
            <p className="text-gray-600 mb-4">응답 검증 현황 및 통계 분석</p>
            <Link
              href="/dashboard/validation"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              대시보드 보기 →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <CubeIcon className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">3D 시각화</h3>
            <p className="text-gray-600 mb-4">4차원 리더십 스타일 3D 표현</p>
            <Link
              href="/visualization"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              시각화 보기 →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <UserGroupIcon className="h-12 w-12 text-indigo-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">팀 분석</h3>
            <p className="text-gray-600 mb-4">팀 전체의 리더십 스타일 분석</p>
            <Link
              href="/team"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              팀 분석 보기 →
            </Link>
          </motion.div>
        </div>

        {/* 4Dx 설명 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">4차원 리더십 모델</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">People (사람)</h4>
              <p className="text-gray-600">팀원의 복지와 성장에 대한 관심도</p>
            </div>
            <div>
              <h4 className="font-semibold text-green-600 mb-2">Production (성과)</h4>
              <p className="text-gray-600">목표 달성과 생산성에 대한 집중도</p>
            </div>
            <div>
              <h4 className="font-semibold text-amber-600 mb-2">Candor (솔직함)</h4>
              <p className="text-gray-600">직접적인 피드백과 도전적 목표 제시</p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">LMX (관계 품질)</h4>
              <p className="text-gray-600">리더와 구성원 간의 신뢰 관계</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
