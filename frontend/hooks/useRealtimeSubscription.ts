/**
 * AI Leadership 4Dx - Realtime 구독 훅
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface RealtimeEvent {
  eventType: string;
  new?: any;
  old?: any;
}

interface UseRealtimeOptions {
  channel: string;
  event?: string;
  table?: string;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onChange?: (payload: any) => void;
}

export const useRealtimeSubscription = ({
  channel,
  event = '*',
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange
}: UseRealtimeOptions) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // Supabase가 초기화되지 않았으면 skip
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return;
    }

    // 채널 생성
    const realtimeChannel = supabase.channel(channel);
    channelRef.current = realtimeChannel;

    // 데이터베이스 변경 구독
    if (table) {
      (realtimeChannel as any).on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter
        },
        (payload: any) => {
          console.log('Realtime event:', payload);
          setLastEvent({
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old
          });

          // 이벤트 타입별 콜백 실행
          switch (payload.eventType) {
            case 'INSERT':
              onInsert?.(payload);
              break;
            case 'UPDATE':
              onUpdate?.(payload);
              break;
            case 'DELETE':
              onDelete?.(payload);
              break;
          }

          // 모든 변경사항에 대한 콜백
          onChange?.(payload);
        }
      );
    }

    // 구독 시작
    realtimeChannel.subscribe((status) => {
      setIsSubscribed(status === 'SUBSCRIBED');
      console.log(`Realtime subscription status: ${status}`);
    });

    // 클린업
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [channel, event, table, filter, onInsert, onUpdate, onDelete, onChange]);

  return {
    isSubscribed,
    lastEvent,
    channel: channelRef.current
  };
};

// 설문 응답 실시간 구독 훅
export const useSurveyResponsesRealtime = (onNewResponse?: (response: any) => void) => {
  return useRealtimeSubscription({
    channel: 'survey-responses',
    table: 'survey_responses',
    event: 'INSERT',
    onInsert: (payload) => {
      console.log('New survey response:', payload.new);
      onNewResponse?.(payload.new);
    }
  });
};

// 분석 결과 실시간 구독 훅
export const useAnalysisResultsRealtime = (
  userId?: string,
  onNewAnalysis?: (analysis: any) => void
) => {
  return useRealtimeSubscription({
    channel: `analysis-${userId || 'all'}`,
    table: 'leadership_analysis',
    event: '*',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    onChange: (payload) => {
      console.log('Analysis update:', payload);
      onNewAnalysis?.(payload.new || payload.old);
    }
  });
};

// 온라인 사용자 프레즌스 훅
export const usePresence = (channelName: string = 'online-users') => {
  const [onlineUsers, setOnlineUsers] = useState<Map<string, any>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: 'user'
        }
      }
    });

    channelRef.current = channel;

    // 프레즌스 상태 동기화
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = new Map();
        
        Object.entries(state).forEach(([key, presences]: [string, any[]]) => {
          if (presences.length > 0) {
            users.set(key, presences[0]);
          }
        });
        
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key);
        setOnlineUsers(prev => new Map(prev).set(key, newPresences[0]));
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('User left:', key);
        setOnlineUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(key);
          return newMap;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // 현재 사용자 정보 전송
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await channel.track({
              userId: user.id,
              email: user.email,
              onlineAt: new Date().toISOString()
            });
          }
        }
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [channelName]);

  return {
    onlineUsers,
    onlineCount: onlineUsers.size
  };
};