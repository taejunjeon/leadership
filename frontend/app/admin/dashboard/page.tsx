/**
 * AI Leadership 4Dx - 관리자 대시보드
 * 숨겨진 분석 결과 (마키아벨리즘, 나르시시즘, 사이코패시) 표시
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { AdminAuth } from '@/components/admin/AdminAuth';
import { HiddenAnalysisResults } from '@/components/admin/HiddenAnalysisResults';
import { SurveyResultsList } from '@/components/admin/SurveyResultsList';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'analysis'>('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {!isAuthenticated ? (
        <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 헤더 */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                관리자 대시보드
              </h1>
              <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                기밀
              </span>
            </div>
            <p className="text-gray-600">
              AI Leadership 4Dx 숨겨진 분석 결과 관리
            </p>
          </div>

          {/* 보안 경고 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8"
          >
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800">보안 주의사항</h3>
                <p className="text-sm text-amber-700 mt-1">
                  이 페이지의 정보는 관리자 전용입니다. 심리적 차원(마키아벨리즘, 나르시시즘, 사이코패시) 
                  분석 결과는 절대 사용자에게 노출되어서는 안 됩니다.
                </p>
              </div>
            </div>
          </motion.div>

          {/* 탭 네비게이션 */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: '개요', icon: ChartBarIcon },
                { id: 'results', label: '설문 결과', icon: DocumentTextIcon },
                { id: 'analysis', label: '숨겨진 분석', icon: EyeIcon }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* 탭 콘텐츠 */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 통계 카드들 */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">총 응답자</h3>
                      <p className="text-3xl font-bold text-blue-600">0</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">위험 신호</h3>
                      <p className="text-3xl font-bold text-red-600">0</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <ChartBarIcon className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">분석 완료</h3>
                      <p className="text-3xl font-bold text-green-600">0%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'results' && (
              <SurveyResultsList 
                onSelectUser={(userId) => setSelectedUser(userId)}
                selectedUser={selectedUser}
              />
            )}

            {activeTab === 'analysis' && selectedUser && (
              <HiddenAnalysisResults userId={selectedUser} />
            )}

            {activeTab === 'analysis' && !selectedUser && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <EyeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  사용자를 선택하세요
                </h3>
                <p className="text-gray-600">
                  설문 결과 탭에서 사용자를 선택하면 숨겨진 분석 결과를 확인할 수 있습니다.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}