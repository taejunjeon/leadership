/**
 * AI Leadership 4Dx - 검증 대시보드 페이지
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  ClockIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { useValidationReport } from '@/hooks/useValidation';
import { ErrorCountBadge } from '@/components/validation/ErrorSummary';
import { AnomalyIndicator } from '@/components/validation/AnomalyAlert';
import { DimensionProgress } from '@/components/validation/ValidationProgress';

// 통계 카드 컴포넌트
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  bgColor,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg p-6 ${bgColor} border border-gray-200`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}% vs 지난주
            </p>
          )}
        </div>
        <div className={`rounded-full p-3 ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default function ValidationDashboard() {
  const { data: report, isLoading } = useValidationReport('current-user');
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');

  // 더미 데이터 (실제로는 API에서 가져옴)
  const validationTrendData = [
    { date: '1일', valid: 45, invalid: 5, warnings: 8 },
    { date: '2일', valid: 52, invalid: 3, warnings: 6 },
    { date: '3일', valid: 48, invalid: 7, warnings: 10 },
    { date: '4일', valid: 63, invalid: 2, warnings: 5 },
    { date: '5일', valid: 58, invalid: 4, warnings: 7 },
    { date: '6일', valid: 71, invalid: 1, warnings: 3 },
    { date: '7일', valid: 67, invalid: 3, warnings: 6 },
  ];

  const errorTypeData = [
    { name: '불완전한 응답', value: 35, color: '#EF4444' },
    { name: '일관성 부족', value: 28, color: '#F59E0B' },
    { name: '이상치', value: 20, color: '#F97316' },
    { name: '중복 응답', value: 17, color: '#FB923C' },
  ];

  const dimensionAccuracyData = [
    { dimension: 'People', accuracy: 92, fill: '#3B82F6' },
    { dimension: 'Production', accuracy: 88, fill: '#10B981' },
    { dimension: 'Candor', accuracy: 85, fill: '#F59E0B' },
    { dimension: 'LMX', accuracy: 90, fill: '#8B5CF6' },
  ];

  const completionRateData = [
    { name: '완료율', value: 78, fill: '#10B981' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">검증 대시보드</h1>
          <p className="mt-2 text-gray-600">AI Leadership 4Dx 응답 검증 현황</p>
        </div>

        {/* 기간 선택 */}
        <div className="mb-6 flex gap-2">
          {(['day', 'week', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {period === 'day' ? '일간' : period === 'week' ? '주간' : '월간'}
            </button>
          ))}
        </div>

        {/* 주요 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="전체 응답"
            value="324"
            change={12}
            icon={<DocumentCheckIcon className="h-6 w-6 text-white" />}
            color="bg-blue-600"
            bgColor="bg-white"
          />
          <StatCard
            title="유효 응답률"
            value="92%"
            change={3}
            icon={<CheckCircleIcon className="h-6 w-6 text-white" />}
            color="bg-green-600"
            bgColor="bg-white"
          />
          <StatCard
            title="평균 검증 시간"
            value="2.3초"
            change={-15}
            icon={<ClockIcon className="h-6 w-6 text-white" />}
            color="bg-purple-600"
            bgColor="bg-white"
          />
          <StatCard
            title="활성 사용자"
            value="89"
            change={8}
            icon={<UsersIcon className="h-6 w-6 text-white" />}
            color="bg-indigo-600"
            bgColor="bg-white"
          />
        </div>

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 검증 추세 차트 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">검증 추세</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={validationTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="valid" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="유효"
                />
                <Line 
                  type="monotone" 
                  dataKey="invalid" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="무효"
                />
                <Line 
                  type="monotone" 
                  dataKey="warnings" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="경고"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* 오류 유형 분포 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">오류 유형 분포</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={errorTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {errorTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* 차원별 정확도 및 완료율 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 차원별 정확도 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 shadow-sm lg:col-span-2"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">차원별 정확도</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dimensionAccuracyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dimension" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="accuracy" radius={[8, 8, 0, 0]}>
                  {dimensionAccuracyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* 전체 완료율 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">전체 완료율</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="60%" 
                outerRadius="90%" 
                data={completionRateData}
              >
                <RadialBar dataKey="value" cornerRadius={10} fill="#10B981" />
                <text 
                  x="50%" 
                  y="50%" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  className="text-3xl font-bold"
                >
                  78%
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">완료</span>
                <span className="font-medium">253명</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">진행 중</span>
                <span className="font-medium">71명</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 실시간 활동 및 최근 이슈 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 실시간 검증 활동 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">실시간 검증 활동</h3>
            <div className="space-y-4">
              {[
                { user: '김철수', action: '설문 완료', status: 'success', time: '방금 전' },
                { user: '이영희', action: '검증 실패', status: 'error', time: '2분 전' },
                { user: '박민수', action: '이상치 감지', status: 'warning', time: '5분 전' },
                { user: '정지원', action: '설문 시작', status: 'info', time: '7분 전' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'error' ? 'bg-red-500' :
                      activity.status === 'warning' ? 'bg-amber-500' :
                      'bg-blue-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                      <p className="text-xs text-gray-500">{activity.action}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 최근 이슈 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 이슈</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">검증 오류</span>
                <ErrorCountBadge count={12} type="error" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">경고</span>
                <ErrorCountBadge count={28} type="warning" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">이상치</span>
                <AnomalyIndicator count={7} severity="high" />
              </div>
              <div className="mt-4">
                <DimensionProgress
                  dimensions={[
                    { name: 'People', completed: 78, total: 85, color: 'blue' },
                    { name: 'Production', completed: 72, total: 85, color: 'green' },
                    { name: 'Candor', completed: 69, total: 85, color: 'yellow' },
                    { name: 'LMX', completed: 74, total: 85, color: 'red' },
                  ]}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}