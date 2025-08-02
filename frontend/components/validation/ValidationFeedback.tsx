/**
 * AI Leadership 4Dx - 실시간 검증 피드백 컴포넌트
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import { ValidationFeedback as ValidationFeedbackType } from '@/types/validation';

interface ValidationFeedbackProps {
  fieldName: string;
  status: ValidationFeedbackType['status'];
  message?: string;
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  idle: {
    icon: null,
    color: 'text-gray-400',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  validating: {
    icon: (
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
    ),
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  success: {
    icon: <CheckCircleIcon className="h-5 w-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  warning: {
    icon: <ExclamationTriangleIcon className="h-5 w-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  error: {
    icon: <XCircleIcon className="h-5 w-5" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  fieldName,
  status,
  message,
  showIcon = true,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const config = statusConfig[status];

  useEffect(() => {
    if (status !== 'idle' && message) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [status, message]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={`${fieldName}-${status}`}
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.2 }}
          className={`mt-1 ${className}`}
        >
          <div
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md text-sm
              ${config.bgColor} ${config.borderColor} border
              ${config.color}
            `}
          >
            {showIcon && config.icon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 30 
                }}
              >
                {config.icon}
              </motion.div>
            )}
            <span className="flex-1">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// 필드 그룹 피드백 컴포넌트
interface FieldGroupFeedbackProps {
  feedbacks: ValidationFeedbackType[];
  className?: string;
}

export const FieldGroupFeedback: React.FC<FieldGroupFeedbackProps> = ({
  feedbacks,
  className = '',
}) => {
  const hasErrors = feedbacks.some(f => f.status === 'error');
  const hasWarnings = feedbacks.some(f => f.status === 'warning');
  const allSuccess = feedbacks.every(f => f.status === 'success');

  let summaryStatus: ValidationFeedbackType['status'] = 'idle';
  let summaryMessage = '';

  if (hasErrors) {
    summaryStatus = 'error';
    const errorCount = feedbacks.filter(f => f.status === 'error').length;
    summaryMessage = `${errorCount}개의 오류가 있습니다`;
  } else if (hasWarnings) {
    summaryStatus = 'warning';
    const warningCount = feedbacks.filter(f => f.status === 'warning').length;
    summaryMessage = `${warningCount}개의 주의사항이 있습니다`;
  } else if (allSuccess && feedbacks.length > 0) {
    summaryStatus = 'success';
    summaryMessage = '모든 항목이 유효합니다';
  }

  return (
    <div className={className}>
      <ValidationFeedback
        fieldName="group"
        status={summaryStatus}
        message={summaryMessage}
      />
      <div className="mt-2 space-y-1">
        {feedbacks
          .filter(f => f.status !== 'idle' && f.status !== 'success')
          .map((feedback, index) => (
            <ValidationFeedback
              key={`${feedback.field}-${index}`}
              fieldName={feedback.field}
              status={feedback.status}
              message={feedback.message}
              className="ml-4"
            />
          ))}
      </div>
    </div>
  );
};

// 인라인 피드백 아이콘
interface InlineValidationIconProps {
  status: ValidationFeedbackType['status'];
  className?: string;
}

export const InlineValidationIcon: React.FC<InlineValidationIconProps> = ({
  status,
  className = '',
}) => {
  const config = statusConfig[status];

  if (status === 'idle' || !config.icon) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={`${config.color} ${className}`}
    >
      {config.icon}
    </motion.div>
  );
};