/**
 * AI Leadership 4Dx - 관리자 인증 컴포넌트
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  EyeSlashIcon,
  LockClosedIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/auth/AuthProvider';

interface AdminAuthProps {
  onAuthenticated: () => void;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ onAuthenticated }) => {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 마스터 관리자 이메일
  const MASTER_ADMIN_EMAIL = 'taejun@biocom.kr';
  // 관리자 비밀번호
  const ADMIN_PASSWORD = 'admin4dx2024!';

  // 로그인 및 권한 확인
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // 로그인하지 않은 경우 로그인 페이지로
        router.push('/auth');
      } else if (user.email === MASTER_ADMIN_EMAIL && userProfile?.role === 'admin') {
        // 마스터 관리자인 경우 자동 인증
        onAuthenticated();
      }
    }
  }, [user, userProfile, authLoading, router, onAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 비밀번호 검증 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 마스터 관리자 확인
    if (user?.email !== MASTER_ADMIN_EMAIL) {
      setError('관리자 권한이 없습니다.');
    } else if (password === ADMIN_PASSWORD) {
      onAuthenticated();
    } else {
      setError('잘못된 관리자 비밀번호입니다.');
    }

    setIsLoading(false);
  };

  // 로딩 중
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-gray-900">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 권한 없음
  if (user && user.email !== MASTER_ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-gray-900">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <ShieldCheckIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">접근 권한 없음</h2>
            <p className="text-gray-600 mb-6">
              이 페이지는 마스터 관리자만 접근할 수 있습니다.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-gray-900">
      <div className="max-w-md w-full px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-xl p-8"
        >
          {/* 로고 */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center"
            >
              <ShieldCheckIcon className="w-8 h-8 text-red-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900">관리자 인증</h2>
            <p className="text-gray-600 mt-2">
              AI Leadership 4Dx 관리자 대시보드
            </p>
            {user && (
              <p className="text-sm text-gray-500 mt-2">
                로그인: {user.email}
              </p>
            )}
          </div>

          {/* 보안 경고 */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <LockClosedIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">기밀 정보 접근</h4>
                <p className="text-sm text-red-700 mt-1">
                  이 페이지는 승인된 관리자만 접근할 수 있습니다.
                  무단 접근 시 법적 책임을 질 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                관리자 비밀번호
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="관리자 비밀번호를 입력하세요"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className={`
                w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-colors
                ${isLoading || !password
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
                }
              `}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  인증 중...
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="w-5 h-5" />
                  관리자 로그인
                </>
              )}
            </button>
          </form>

          {/* 개발용 힌트 */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              💡 개발용 비밀번호: admin4dx2024!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};