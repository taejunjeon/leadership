/**
 * AI Leadership 4Dx - 네비게이션 컴포넌트
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/auth/AuthProvider';

export const Navigation: React.FC = () => {
  const { user, userProfile, signOut, loading } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">4D</span>
            </div>
            <span className="text-xl font-bold text-gray-900">AI Leadership 4Dx</span>
          </Link>

          {/* 네비게이션 메뉴 */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/survey"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              설문 진단
            </Link>
            <Link
              href="/visualization"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              3D 시각화
            </Link>
            <Link
              href="/ai-test"
              className="text-gray-600 hover:text-purple-600 font-medium transition-colors"
            >
              AI 테스트
            </Link>
            {userProfile?.role === 'admin' && (
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-red-600 font-medium transition-colors"
              >
                관리자
              </Link>
            )}
          </div>

          {/* 사용자 메뉴 */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="hidden md:block font-medium">
                    {userProfile?.name || '사용자'}
                  </span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>

                {/* 드롭다운 메뉴 */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {userProfile?.name}
                        </p>
                        <p className="text-xs text-gray-500">{userProfile?.email}</p>
                        {userProfile?.organization && (
                          <p className="text-xs text-gray-500">
                            {userProfile.organization}
                          </p>
                        )}
                      </div>
                      
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Cog6ToothIcon className="w-4 h-4 mr-2" />
                        프로필 설정
                      </Link>
                      
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                        로그아웃
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/auth?mode=signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 - 추후 구현 */}
    </nav>
  );
};