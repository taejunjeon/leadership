/**
 * AI Leadership 4Dx - 검증 진행률 컴포넌트
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/solid';

interface ValidationStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  description?: string;
}

interface ValidationProgressProps {
  steps: ValidationStep[];
  currentStep?: number;
  className?: string;
}

export const ValidationProgress: React.FC<ValidationProgressProps> = ({
  steps,
  currentStep = 0,
  className = '',
}) => {
  return (
    <div className={`${className}`}>
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />
        
        {/* Active Progress Line */}
        <motion.div
          className="absolute left-4 top-4 w-0.5 bg-blue-600"
          initial={{ height: 0 }}
          animate={{
            height: `${(currentStep / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {/* Steps */}
        <div className="relative space-y-8">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const hasError = step.status === 'error';

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                {/* Step Indicator */}
                <div className="relative flex-shrink-0">
                  <motion.div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      transition-colors duration-200
                      ${
                        hasError
                          ? 'bg-red-100 border-2 border-red-600'
                          : isCompleted
                          ? 'bg-blue-600'
                          : isActive
                          ? 'bg-blue-600 ring-4 ring-blue-100'
                          : 'bg-white border-2 border-gray-300'
                      }
                    `}
                    animate={
                      isActive
                        ? {
                            scale: [1, 1.1, 1],
                            transition: {
                              duration: 2,
                              repeat: Infinity,
                              repeatType: 'reverse',
                            },
                          }
                        : {}
                    }
                  >
                    {hasError ? (
                      <span className="text-red-600 font-bold text-xs">!</span>
                    ) : isCompleted ? (
                      <CheckIcon className="w-4 h-4 text-white" />
                    ) : (
                      <span
                        className={`
                          text-xs font-semibold
                          ${isActive ? 'text-white' : 'text-gray-500'}
                        `}
                      >
                        {index + 1}
                      </span>
                    )}
                  </motion.div>
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-0.5">
                  <h3
                    className={`
                      text-sm font-medium
                      ${
                        hasError
                          ? 'text-red-900'
                          : isActive
                          ? 'text-gray-900'
                          : isCompleted
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      }
                    `}
                  >
                    {step.label}
                  </h3>
                  {step.description && (
                    <p
                      className={`
                        mt-1 text-xs
                        ${
                          hasError
                            ? 'text-red-600'
                            : isActive
                            ? 'text-gray-600'
                            : 'text-gray-400'
                        }
                      `}
                    >
                      {step.description}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 간단한 진행률 바
interface SimpleProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  className?: string;
}

export const SimpleProgressBar: React.FC<SimpleProgressBarProps> = ({
  value,
  label,
  showPercentage = true,
  color = 'blue',
  className = '',
}) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
  };

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(value)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

// 차원별 검증 진행률
interface DimensionProgressProps {
  dimensions: {
    name: string;
    completed: number;
    total: number;
    color?: 'blue' | 'green' | 'yellow' | 'red';
  }[];
  className?: string;
}

export const DimensionProgress: React.FC<DimensionProgressProps> = ({
  dimensions,
  className = '',
}) => {
  const totalCompleted = dimensions.reduce((sum, d) => sum + d.completed, 0);
  const totalQuestions = dimensions.reduce((sum, d) => sum + d.total, 0);
  const overallProgress = totalQuestions > 0 ? (totalCompleted / totalQuestions) * 100 : 0;

  return (
    <div className={className}>
      <div className="mb-4">
        <SimpleProgressBar
          value={overallProgress}
          label="전체 진행률"
          color={overallProgress === 100 ? 'green' : 'blue'}
        />
      </div>
      
      <div className="space-y-3">
        {dimensions.map((dimension) => {
          const progress = dimension.total > 0 
            ? (dimension.completed / dimension.total) * 100 
            : 0;
          
          return (
            <div key={dimension.name} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-600">
                  {dimension.name}
                </span>
                <span className="text-xs text-gray-500">
                  {dimension.completed}/{dimension.total}
                </span>
              </div>
              <SimpleProgressBar
                value={progress}
                showPercentage={false}
                color={dimension.color || (progress === 100 ? 'green' : 'blue')}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};