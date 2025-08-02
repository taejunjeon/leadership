/**
 * AI Leadership 4Dx - 오류 요약 컴포넌트
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { ValidationError, ValidationWarning } from '@/types/validation';

interface ErrorSummaryProps {
  errors: ValidationError[];
  warnings: ValidationWarning[];
  onFixError?: (error: ValidationError) => void;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({
  errors,
  warnings,
  onFixError,
  className = '',
  collapsible = true,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const hasIssues = errors.length > 0 || warnings.length > 0;
  if (!hasIssues) return null;

  const errorsByField = errors.reduce((acc, error) => {
    if (!acc[error.field]) acc[error.field] = [];
    acc[error.field].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);

  const warningsBySeverity = warnings.reduce((acc, warning) => {
    if (!acc[warning.severity]) acc[warning.severity] = [];
    acc[warning.severity].push(warning);
    return acc;
  }, {} as Record<string, ValidationWarning[]>);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border ${
        errors.length > 0 
          ? 'border-red-200 bg-red-50' 
          : 'border-amber-200 bg-amber-50'
      } ${className}`}
    >
      {/* Header */}
      <div
        className={`px-4 py-3 ${
          collapsible ? 'cursor-pointer select-none' : ''
        }`}
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {errors.length > 0 ? (
              <XCircleIcon className="h-5 w-5 text-red-600" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
            )}
            <div>
              <h3 className={`font-medium ${
                errors.length > 0 ? 'text-red-900' : 'text-amber-900'
              }`}>
                {errors.length > 0 && `${errors.length}개의 오류`}
                {errors.length > 0 && warnings.length > 0 && ', '}
                {warnings.length > 0 && `${warnings.length}개의 주의사항`}
              </h3>
              <p className={`text-sm ${
                errors.length > 0 ? 'text-red-700' : 'text-amber-700'
              }`}>
                {errors.length > 0 
                  ? '계속하기 전에 오류를 수정해주세요'
                  : '검토가 필요한 사항이 있습니다'
                }
              </p>
            </div>
          </div>
          {collapsible && (
            <motion.div
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Errors */}
              {Object.entries(errorsByField).map(([field, fieldErrors]) => (
                <div key={field} className="space-y-2">
                  <h4 className="text-sm font-medium text-red-900">
                    {field}
                  </h4>
                  {fieldErrors.map((error, index) => (
                    <motion.div
                      key={`${field}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-2 pl-4"
                    >
                      <XCircleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-red-700">{error.message}</p>
                        {error.code && (
                          <p className="text-xs text-red-600 mt-0.5">
                            코드: {error.code}
                          </p>
                        )}
                      </div>
                      {onFixError && (
                        <button
                          onClick={() => onFixError(error)}
                          className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
                        >
                          수정
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              ))}

              {/* Divider */}
              {errors.length > 0 && warnings.length > 0 && (
                <div className="border-t border-amber-200" />
              )}

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="space-y-3">
                  {(['high', 'medium', 'low'] as const).map((severity) => {
                    const severityWarnings = warningsBySeverity[severity];
                    if (!severityWarnings?.length) return null;

                    return (
                      <div key={severity} className="space-y-2">
                        <h4 className="text-sm font-medium text-amber-900 capitalize">
                          {severity === 'high' ? '높음' : severity === 'medium' ? '중간' : '낮음'} 주의
                        </h4>
                        {severityWarnings.map((warning, index) => (
                          <motion.div
                            key={`${warning.type}-${index}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-start gap-2 pl-4"
                          >
                            <ExclamationTriangleIcon 
                              className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                                severity === 'high' 
                                  ? 'text-orange-600' 
                                  : severity === 'medium'
                                  ? 'text-amber-500'
                                  : 'text-yellow-500'
                              }`} 
                            />
                            <p className="text-sm text-amber-700 flex-1">
                              {warning.message}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// 간단한 에러 카운트 표시
interface ErrorCountBadgeProps {
  count: number;
  type?: 'error' | 'warning';
  onClick?: () => void;
}

export const ErrorCountBadge: React.FC<ErrorCountBadgeProps> = ({
  count,
  type = 'error',
  onClick,
}) => {
  if (count === 0) return null;

  const isError = type === 'error';

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium
        ${isError 
          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
        }
        transition-colors cursor-pointer
      `}
    >
      {isError ? (
        <XCircleIcon className="h-3 w-3" />
      ) : (
        <ExclamationTriangleIcon className="h-3 w-3" />
      )}
      {count}
    </motion.button>
  );
};