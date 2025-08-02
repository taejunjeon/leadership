/**
 * AI Leadership 4Dx - 3D 시각화 페이지
 */

'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { 
  CubeIcon, 
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// 3D 컴포넌트는 SSR 비활성화 (Three.js는 브라우저에서만 작동)
const Leadership3DVisualization = dynamic(
  () => import('@/components/visualization/Leadership3DVisualization').then(mod => mod.Leadership3DVisualization),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">3D 환경을 불러오는 중...</p>
        </div>
      </div>
    )
  }
);

// 샘플 데이터 생성
const generateSampleData = () => {
  const styles = [
    { name: '김철수', style: 'Team Leader', people: 6.2, production: 7.1, candor: 6.5, lmx: 6.3, influence: 2.1, riskLevel: 'low' as const },
    { name: '이영희', style: 'Task Manager', people: 4.5, production: 8.2, candor: 7.8, lmx: 5.1, influence: 3.4, riskLevel: 'medium' as const },
    { name: '박민수', style: 'Authority-Compliance', people: 3.1, production: 8.8, candor: 8.5, lmx: 4.2, influence: 4.2, riskLevel: 'high' as const },
    { name: '정다은', style: 'Country Club', people: 7.8, production: 3.2, candor: 2.5, lmx: 7.1, influence: 1.8, riskLevel: 'low' as const },
    { name: '최준호', style: 'Middle-of-the-Road', people: 5.0, production: 5.0, candor: 5.0, lmx: 5.5, influence: 2.5, riskLevel: 'low' as const },
    { name: '강서연', style: 'Impoverished', people: 2.1, production: 2.3, candor: 1.8, lmx: 2.5, influence: 1.2, riskLevel: 'high' as const },
  ];

  return styles.map((style, index) => ({
    id: `user_${index + 1}`,
    ...style
  }));
};

export default function VisualizationPage() {
  const [data, setData] = useState(() => generateSampleData());
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [showControls, setShowControls] = useState(true);
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('all');

  // 필터링된 데이터
  const filteredData = filterRiskLevel === 'all' 
    ? data 
    : data.filter(d => d.riskLevel === filterRiskLevel);

  // 선택된 사용자 정보
  const selectedUser = selectedId ? data.find(d => d.id === selectedId) : undefined;

  // 데이터 새로고침
  const refreshData = () => {
    setData(generateSampleData());
    setSelectedId(undefined);
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') refreshData();
      if (e.key === 'c' || e.key === 'C') setShowControls(prev => !prev);
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <CubeIcon className="w-8 h-8 text-purple-600" />
            4D 리더십 시각화
          </h1>
          <p className="text-gray-600">
            리더십 스타일을 4차원 공간에서 탐색하세요
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 3D 시각화 영역 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-lg shadow-lg p-4 h-[600px]">
              <Leadership3DVisualization
                data={filteredData}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>

            {/* 컨트롤 힌트 */}
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
              <div className="flex gap-4">
                <span>🖱️ 마우스로 회전</span>
                <span>📌 클릭으로 선택</span>
                <span>🔍 스크롤로 확대/축소</span>
              </div>
              <div className="flex gap-4">
                <kbd className="px-2 py-1 bg-gray-100 rounded">R</kbd> 새로고침
                <kbd className="px-2 py-1 bg-gray-100 rounded">C</kbd> 컨트롤 토글
              </div>
            </div>
          </motion.div>

          {/* 사이드바 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* 필터 컨트롤 */}
            {showControls && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="w-5 h-5" />
                  필터 옵션
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      위험도 필터
                    </label>
                    <select
                      value={filterRiskLevel}
                      onChange={(e) => setFilterRiskLevel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">전체 보기</option>
                      <option value="low">낮음</option>
                      <option value="medium">보통</option>
                      <option value="high">높음</option>
                    </select>
                  </div>

                  <button
                    onClick={refreshData}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    데이터 새로고침
                  </button>
                </div>
              </div>
            )}

            {/* 선택된 사용자 정보 */}
            {selectedUser && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserGroupIcon className="w-5 h-5" />
                  {selectedUser.name}
                </h3>
                
                <div className="space-y-3">
                  <div className="pb-3 border-b border-gray-200">
                    <p className="text-sm text-gray-600">리더십 스타일</p>
                    <p className="font-semibold">{selectedUser.style}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">People</span>
                      <span className="font-medium">{selectedUser.people.toFixed(1)}/7.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Production</span>
                      <span className="font-medium">{selectedUser.production.toFixed(1)}/7.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Candor</span>
                      <span className="font-medium">{selectedUser.candor.toFixed(1)}/7.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">LMX</span>
                      <span className="font-medium">{selectedUser.lmx.toFixed(1)}/7.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Influence</span>
                      <span className="font-medium">{selectedUser.influence.toFixed(1)}/5.0</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">위험도</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedUser.riskLevel === 'high' 
                          ? 'bg-red-100 text-red-700'
                          : selectedUser.riskLevel === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {selectedUser.riskLevel === 'high' ? '높음' : 
                         selectedUser.riskLevel === 'medium' ? '보통' : '낮음'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 도움말 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex gap-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-medium text-blue-900 mb-1">시각화 팁</h4>
                  <ul className="text-blue-700 space-y-1">
                    <li>• 구체를 클릭하여 상세 정보 확인</li>
                    <li>• 크기가 클수록 영향력이 높음</li>
                    <li>• 빨간색은 낮은 LMX, 초록색은 높은 LMX</li>
                    <li>• 빛나는 구체는 높은 위험도 표시</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}