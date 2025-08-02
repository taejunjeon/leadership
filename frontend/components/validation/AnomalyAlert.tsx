/**
 * AI Leadership 4Dx - 이상치 경고 모달 컴포넌트
 */

'use client';

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Outlier } from '@/types/validation';

interface AnomalyAlertProps {
  isOpen: boolean;
  onClose: () => void;
  anomalies: Outlier[];
  onAccept: () => void;
  onDismiss: () => void;
}

const severityColors = {
  low: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-800',
    icon: 'text-yellow-400',
  },
  medium: {
    bg: 'bg-orange-50',
    border: 'border-orange-400',
    text: 'text-orange-800',
    icon: 'text-orange-400',
  },
  high: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-800',
    icon: 'text-red-400',
  },
};

export const AnomalyAlert: React.FC<AnomalyAlertProps> = ({
  isOpen,
  onClose,
  anomalies,
  onAccept,
  onDismiss,
}) => {
  const highSeverityCount = anomalies.filter(a => a.severity === 'high').length;
  const mediumSeverityCount = anomalies.filter(a => a.severity === 'medium').length;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                      <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold leading-6 text-gray-900"
                      >
                        이상 패턴 감지
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        {anomalies.length}개의 이상 패턴이 발견되었습니다
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-md p-1 hover:bg-gray-100 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                {/* Severity Summary */}
                {(highSeverityCount > 0 || mediumSeverityCount > 0) && (
                  <div className="mb-4 flex gap-2">
                    {highSeverityCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                        <span className="h-2 w-2 rounded-full bg-red-400" />
                        높음 {highSeverityCount}개
                      </span>
                    )}
                    {mediumSeverityCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
                        <span className="h-2 w-2 rounded-full bg-orange-400" />
                        중간 {mediumSeverityCount}개
                      </span>
                    )}
                  </div>
                )}

                {/* Anomaly List */}
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {anomalies.map((anomaly, index) => {
                    const colors = severityColors[anomaly.severity];
                    return (
                      <motion.div
                        key={`${anomaly.dimension}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
                          rounded-lg border p-3
                          ${colors.bg} ${colors.border}
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <ExclamationTriangleIcon 
                            className={`h-5 w-5 mt-0.5 flex-shrink-0 ${colors.icon}`} 
                          />
                          <div className="flex-1">
                            <h4 className={`font-medium ${colors.text}`}>
                              {anomaly.dimension}
                            </h4>
                            <p className={`text-sm mt-1 ${colors.text} opacity-90`}>
                              {anomaly.reason}
                            </p>
                            {anomaly.score > 0 && (
                              <p className={`text-xs mt-1 ${colors.text} opacity-75`}>
                                이상치 점수: {anomaly.score.toFixed(1)}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    className="flex-1 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onDismiss}
                  >
                    무시하고 계속
                  </button>
                  <button
                    type="button"
                    className="flex-1 inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onAccept}
                  >
                    수정하기
                  </button>
                </div>

                {/* Help Text */}
                <p className="mt-4 text-xs text-gray-500 text-center">
                  이상 패턴은 일반적이지 않은 응답을 나타냅니다. 
                  실제 상황을 정확히 반영한 것이라면 무시해도 됩니다.
                </p>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// 간단한 이상치 표시 컴포넌트
interface AnomalyIndicatorProps {
  count: number;
  severity?: 'low' | 'medium' | 'high';
  onClick?: () => void;
}

export const AnomalyIndicator: React.FC<AnomalyIndicatorProps> = ({
  count,
  severity,
  onClick,
}) => {
  if (count === 0) return null;

  const colors = severity ? severityColors[severity] : severityColors.medium;

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium
        ${colors.bg} ${colors.text} ${colors.border} border
        hover:opacity-90 transition-opacity cursor-pointer
      `}
    >
      <ExclamationTriangleIcon className="h-3.5 w-3.5" />
      <span>{count}개 이상치</span>
    </motion.button>
  );
};