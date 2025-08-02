/**
 * AI Leadership 4Dx - 프로필 설정 페이지
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    department: '',
    position: ''
  });

  // 사용자 정보 로드
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }

    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || user?.email || '',
        organization: userProfile.organization || '',
        department: userProfile.department || '',
        position: userProfile.position || ''
      });
    }
  }, [user, userProfile, authLoading, router]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSaved(false);

    try {
      // users 테이블 업데이트
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: formData.name,
          organization: formData.organization,
          department: formData.department,
          position: formData.position,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      setSaved(true);
      
      // 3초 후 저장 완료 메시지 숨기기
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      setError('프로필 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            뒤로 가기
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">프로필 설정</h1>
          <p className="mt-2 text-gray-600">
            계정 정보와 소속 정보를 관리하세요
          </p>
        </div>

        {/* 프로필 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          {/* 프로필 아바타 */}
          <div className="flex items-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-blue-600" />
            </div>
            <div className="ml-6">
              <h2 className="text-xl font-semibold text-gray-900">{formData.name || '사용자'}</h2>
              <p className="text-gray-500">{formData.email}</p>
              {userProfile?.role === 'admin' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
                  관리자
                </span>
              )}
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 프로필 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="홍길동"
                  required
                />
              </div>
            </div>

            {/* 이메일 (읽기 전용) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  disabled
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">이메일은 변경할 수 없습니다</p>
            </div>

            {/* 소속 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                소속 회사/조직
              </label>
              <div className="relative">
                <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => handleChange('organization', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="회사명"
                />
              </div>
            </div>

            {/* 부서 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                부서
              </label>
              <div className="relative">
                <BriefcaseIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="개발팀"
                />
              </div>
            </div>

            {/* 직책 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                직책
              </label>
              <div className="relative">
                <BriefcaseIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="팀장"
                />
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                취소
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="relative inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : saved ? (
                  <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    저장 완료
                  </>
                ) : (
                  '변경사항 저장'
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* 추가 정보 */}
        <div className="mt-8 space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              🔒 개인정보 보호
            </h3>
            <p className="text-sm text-blue-700">
              귀하의 개인정보는 안전하게 보호되며, 리더십 분석 목적으로만 사용됩니다.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              📊 프로필 완성도
            </h3>
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>프로필 정보</span>
                <span>{formData.organization && formData.department && formData.position ? '100%' : '60%'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: formData.organization && formData.department && formData.position ? '100%' : '60%' 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}