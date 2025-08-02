/**
 * AI Leadership 4Dx - 실시간 알림 컴포넌트
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellIcon, 
  XMarkIcon,
  UserIcon,
  DocumentCheckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useSurveyResponsesRealtime, useAnalysisResultsRealtime } from '@/hooks/useRealtimeSubscription';

interface Notification {
  id: string;
  type: 'survey' | 'analysis' | 'alert';
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
}

export const RealtimeNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 새로운 설문 응답 구독
  const { isSubscribed: surveySubscribed } = useSurveyResponsesRealtime((response) => {
    const notification: Notification = {
      id: `survey-${response.id}`,
      type: 'survey',
      title: '새로운 설문 응답',
      message: `${response.user_id}님이 설문을 완료했습니다.`,
      timestamp: new Date(response.created_at),
      data: response
    };
    
    setNotifications(prev => [notification, ...prev].slice(0, 20)); // 최대 20개
    setUnreadCount(prev => prev + 1);
  });

  // 새로운 분석 결과 구독
  const { isSubscribed: analysisSubscribed } = useAnalysisResultsRealtime(undefined, (analysis) => {
    if (!analysis) return;
    
    const notification: Notification = {
      id: `analysis-${analysis.id}`,
      type: 'analysis',
      title: '분석 완료',
      message: `위험도: ${analysis.overall_risk_level === 'high' ? '⚠️ 높음' : 
                          analysis.overall_risk_level === 'medium' ? '⚡ 보통' : '✅ 낮음'}`,
      timestamp: new Date(analysis.created_at),
      data: analysis
    };
    
    setNotifications(prev => [notification, ...prev].slice(0, 20));
    setUnreadCount(prev => prev + 1);

    // 높은 위험도는 특별 알림
    if (analysis.overall_risk_level === 'high') {
      notification.type = 'alert';
      notification.title = '⚠️ 높은 위험도 감지';
    }
  });

  // 알림 제거
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // 알림 창 열기/닫기
  const toggleNotifications = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0); // 열면 읽음 처리
    }
  };

  // 알림 아이콘 선택
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'survey':
        return <DocumentCheckIcon className="w-5 h-5 text-blue-600" />;
      case 'analysis':
        return <UserIcon className="w-5 h-5 text-green-600" />;
      case 'alert':
        return <ExclamationCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <>
      {/* 알림 버튼 */}
      <div className="relative">
        <button
          onClick={toggleNotifications}
          className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <BellIcon className="w-6 h-6" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </button>

        {/* 연결 상태 표시 */}
        <div className="absolute bottom-0 right-0 w-2 h-2">
          <span className={`block w-2 h-2 rounded-full ${
            surveySubscribed && analysisSubscribed ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        </div>
      </div>

      {/* 알림 패널 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, x: 10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10, x: 10 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">실시간 알림</h3>
              <button
                onClick={toggleNotifications}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* 알림 목록 */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <BellIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>새로운 알림이 없습니다</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.timestamp).toLocaleTimeString('ko-KR')}
                          </p>
                        </div>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  연결 상태: {surveySubscribed && analysisSubscribed ? '✅ 실시간' : '⏸️ 대기 중'}
                </span>
                <button
                  onClick={() => setNotifications([])}
                  className="text-blue-600 hover:text-blue-700"
                >
                  모두 지우기
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};