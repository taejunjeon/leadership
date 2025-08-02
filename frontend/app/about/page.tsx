/**
 * AI Leadership 4Dx - Grid 3.0 상세 소개 페이지
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon, 
  UserGroupIcon,
  SparklesIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  RocketLaunchIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

// 이론 섹션 데이터
const theories = [
  {
    id: 'blake-mouton',
    title: 'Blake-Mouton Managerial Grid',
    subtitle: '사람 지향 vs. 성과 지향',
    icon: ChartBarIcon,
    color: 'blue',
    year: '1964',
    authors: 'Robert Blake & Jane Mouton',
    description: '리더십 스타일을 \'사람에 대한 관심\'과 \'성과/생산에 대한 관심\' 두 축으로 평가합니다. 각 축은 1점(낮음)에서 9점(높음)까지 점수화되며, 리더의 균형을 좌표로 표현합니다.',
    ideal: '팀 관리형(9,9) - 두 축 모두 높은 균형잡힌 리더십',
    types: [
      { name: '팀 관리형 (9,9)', desc: '사람과 성과의 균형을 완벽하게 달성', emoji: '🌟' },
      { name: '클럽 관리형 (1,9)', desc: '팀 관계 중시, 성과 관리 미흡', emoji: '🤝' },
      { name: '과업 관리형 (9,1)', desc: '목표 달성 집중, 팀원 감정 무시', emoji: '🎯' },
      { name: '중도 관리형 (5,5)', desc: '평범한 균형, 혁신 부족', emoji: '⚖️' },
      { name: '빈곤 관리형 (1,1)', desc: '관심 부족, 리더십 부재', emoji: '😴' }
    ]
  },
  {
    id: 'radical-candor',
    title: 'Radical Candor',
    subtitle: '갈등 회피 vs. 솔직한 피드백',
    icon: ChatBubbleLeftRightIcon,
    color: 'purple',
    year: '2017',
    authors: 'Kim Scott',
    description: '효과적인 피드백을 \'갈등 회피적 태도\'와 \'직접적 도전\' 두 축으로 분석합니다. 피드백이 균형 잡히지 않으면 팀 신뢰가 깨질 수 있습니다.',
    ideal: 'Radical Candor - 갈등을 회피하지 않고 솔직한 피드백 제공',
    types: [
      { name: 'Radical Candor', desc: '솔직하고 배려있는 피드백', emoji: '💎' },
      { name: 'Obnoxious Aggression', desc: '직설적이지만 배려 부족', emoji: '⚡' },
      { name: 'Ruinous Empathy', desc: '배려는 있지만 솔직함 부족', emoji: '💔' },
      { name: 'Manipulative Insincerity', desc: '배려도 솔직함도 부족', emoji: '🎭' }
    ]
  },
  {
    id: 'lmx',
    title: 'LMX (Leader-Member Exchange)',
    subtitle: '리더-팀원 관계 질',
    icon: HeartIcon,
    color: 'green',
    year: '1970s',
    authors: 'Fred Dansereau et al.',
    description: '리더와 팀원 간의 관계 질을 \'신뢰, 존중, 충성\'으로 평가합니다. 고품질 관계가 팀 성과, 만족도, 헌신을 높입니다.',
    ideal: '고품질 LMX - 상호 신뢰와 지지가 강한 관계',
    types: [
      { name: '고품질 LMX (6점 이상)', desc: '상호 존중과 신뢰의 관계', emoji: '🤲' },
      { name: '중간 LMX (4-5점)', desc: '기본적 신뢰, 깊이 부족', emoji: '🤷' },
      { name: '저품질 LMX (4점 미만)', desc: '거래적 관계, 동기부여 부족', emoji: '📉' }
    ]
  }
];

// 인터랙티브 Grid 컴포넌트
function InteractiveGrid() {
  const [hoveredCell, setHoveredCell] = useState<{x: number, y: number} | null>(null);
  
  const gridTypes = {
    '1,1': { name: '빈곤 관리형', color: 'bg-gray-500' },
    '1,5': { name: '중간 사람형', color: 'bg-blue-400' },
    '1,9': { name: '클럽 관리형', color: 'bg-blue-600' },
    '5,1': { name: '중간 과업형', color: 'bg-orange-400' },
    '5,5': { name: '중도 관리형', color: 'bg-yellow-500' },
    '5,9': { name: '균형 추구형', color: 'bg-green-400' },
    '9,1': { name: '과업 관리형', color: 'bg-red-600' },
    '9,5': { name: '성과 중심형', color: 'bg-orange-500' },
    '9,9': { name: '팀 관리형', color: 'bg-green-600' }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="grid grid-cols-9 gap-1 p-4 bg-gray-100 rounded-lg">
        {[9, 8, 7, 6, 5, 4, 3, 2, 1].map(y => (
          <React.Fragment key={y}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => {
              const key = `${x},${y}`;
              const type = gridTypes[key as keyof typeof gridTypes];
              const isSpecial = !!type;
              
              return (
                <motion.div
                  key={key}
                  className={`
                    aspect-square rounded cursor-pointer
                    ${isSpecial ? type.color : 'bg-gray-300'}
                    ${hoveredCell?.x === x && hoveredCell?.y === y ? 'ring-2 ring-white' : ''}
                  `}
                  whileHover={{ scale: isSpecial ? 1.2 : 1.05 }}
                  onMouseEnter={() => setHoveredCell({ x, y })}
                  onMouseLeave={() => setHoveredCell(null)}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
      
      {/* 축 라벨 */}
      <div className="absolute -bottom-8 left-0 right-0 text-center text-sm font-medium">
        성과/생산 관심도 →
      </div>
      <div className="absolute top-0 -left-8 bottom-0 flex items-center justify-center">
        <div className="transform -rotate-90 text-sm font-medium whitespace-nowrap">
          사람 관심도 →
        </div>
      </div>
      
      {/* 호버 정보 */}
      <AnimatePresence>
        {hoveredCell && gridTypes[`${hoveredCell.x},${hoveredCell.y}` as keyof typeof gridTypes] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap"
          >
            {gridTypes[`${hoveredCell.x},${hoveredCell.y}` as keyof typeof gridTypes].name} ({hoveredCell.x}, {hoveredCell.y})
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AboutPage() {
  const [activeTheory, setActiveTheory] = useState('blake-mouton');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Grid 3.0 리더십 매핑 플랫폼
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            스타트업의 리더십을 데이터 기반으로 진단하고 코칭하는 혁신적인 플랫폼
          </p>
        </motion.div>

        {/* 핵심 가치 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <AcademicCapIcon className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">과학적 기반</h3>
            <p className="text-gray-600">60년 이상 검증된 3가지 핵심 리더십 이론을 통합</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <SparklesIcon className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI 기반 코칭</h3>
            <p className="text-gray-600">GPT-4.1과 Claude 4 Sonnet의 개인화된 리더십 인사이트</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <RocketLaunchIcon className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">즉시 실행 가능</h3>
            <p className="text-gray-600">43개 문항, 10분 설문으로 즉시 활용 가능한 인사이트 제공</p>
          </motion.div>
        </div>

        {/* 이론 탭 네비게이션 */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex flex-wrap border-b">
            {theories.map((theory) => {
              const Icon = theory.icon;
              return (
                <button
                  key={theory.id}
                  onClick={() => setActiveTheory(theory.id)}
                  className={`
                    flex items-center px-6 py-4 font-medium transition-colors
                    ${activeTheory === theory.id 
                      ? `text-${theory.color}-600 border-b-2 border-${theory.color}-600 bg-${theory.color}-50` 
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">{theory.title}</span>
                  <span className="sm:hidden">{theory.subtitle.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* 이론 상세 내용 */}
          <AnimatePresence mode="wait">
            {theories.map((theory) => {
              if (theory.id !== activeTheory) return null;
              
              return (
                <motion.div
                  key={theory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-8"
                >
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {theory.title}
                    </h2>
                    <p className="text-lg text-gray-600 mb-4">{theory.subtitle}</p>
                    
                    <div className="flex flex-wrap gap-4 mb-6 text-sm">
                      <span className="flex items-center text-gray-500">
                        <AcademicCapIcon className="h-4 w-4 mr-1" />
                        {theory.authors}
                      </span>
                      <span className="flex items-center text-gray-500">
                        <LightBulbIcon className="h-4 w-4 mr-1" />
                        {theory.year}년 개발
                      </span>
                    </div>

                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {theory.description}
                    </p>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                      <p className="font-medium text-gray-900">
                        <span className="text-blue-600">이상적 상태:</span> {theory.ideal}
                      </p>
                    </div>
                  </div>

                  {/* Blake-Mouton 인터랙티브 그리드 */}
                  {theory.id === 'blake-mouton' && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                        인터랙티브 리더십 그리드
                      </h3>
                      <InteractiveGrid />
                    </div>
                  )}

                  {/* 리더 유형 카드 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {theory.types.map((type, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => setExpandedSection(expandedSection === type.name ? null : type.name)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-2xl mr-3">{type.emoji}</span>
                            <h4 className="inline font-medium text-gray-900">{type.name}</h4>
                          </div>
                          <ChevronDownIcon 
                            className={`h-5 w-5 text-gray-400 transition-transform ${
                              expandedSection === type.name ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                        <AnimatePresence>
                          {expandedSection === type.name && (
                            <motion.p
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="text-gray-600 mt-2 text-sm"
                            >
                              {type.desc}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* 4D 매핑 설명 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-xl p-8 mb-12 text-white"
        >
          <h2 className="text-2xl font-bold mb-4">4D 리더십 매핑 시스템</h2>
          <p className="mb-6 text-lg opacity-90">
            Grid 3.0은 세 가지 이론을 통합하여 리더십을 4차원으로 분석합니다:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <UserGroupIcon className="h-8 w-8 mb-2" />
              <h3 className="font-semibold">1차원: 사람 지향</h3>
              <p className="text-sm opacity-80">팀원의 복지와 성장에 대한 관심</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <ChartBarIcon className="h-8 w-8 mb-2" />
              <h3 className="font-semibold">2차원: 성과 지향</h3>
              <p className="text-sm opacity-80">목표 달성과 생산성 추구</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <ChatBubbleLeftRightIcon className="h-8 w-8 mb-2" />
              <h3 className="font-semibold">3차원: 솔직함</h3>
              <p className="text-sm opacity-80">직접적 피드백과 도전</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <HeartIcon className="h-8 w-8 mb-2" />
              <h3 className="font-semibold">4차원: 관계 품질</h3>
              <p className="text-sm opacity-80">리더-구성원 간 신뢰</p>
            </div>
          </div>
        </motion.div>

        {/* CTA 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            지금 바로 당신의 리더십을 진단해보세요
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            43개의 과학적 문항으로 10분 만에 완성되는 4D 리더십 프로필. 
            AI가 제공하는 맞춤형 코칭 카드로 즉시 실천 가능한 행동 변화를 시작하세요.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/survey"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              설문 시작하기
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center px-8 py-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}