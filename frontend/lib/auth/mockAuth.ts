/**
 * Mock Auth Service for Development
 * Supabase 없이 로컬 개발을 위한 임시 인증 서비스
 */

interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

class MockAuthService {
  private currentUser: MockUser | null = null;
  private users: Map<string, { password: string; user: MockUser }> = new Map();

  constructor() {
    // 기본 테스트 사용자 추가
    this.users.set('admin@test.com', {
      password: 'admin123',
      user: {
        id: 'admin-001',
        email: 'admin@test.com',
        name: '관리자',
        role: 'admin'
      }
    });

    this.users.set('user@test.com', {
      password: 'user123',
      user: {
        id: 'user-001',
        email: 'user@test.com',
        name: '일반 사용자',
        role: 'user'
      }
    });
  }

  async signIn(email: string, password: string): Promise<{ user: MockUser | null; error: any }> {
    const userData = this.users.get(email);
    
    if (!userData || userData.password !== password) {
      return {
        user: null,
        error: { message: '이메일 또는 비밀번호가 올바르지 않습니다.' }
      };
    }

    this.currentUser = userData.user;
    
    // 로컬 스토리지에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('mockAuthUser', JSON.stringify(this.currentUser));
    }

    return { user: this.currentUser, error: null };
  }

  async signUp(email: string, password: string, metadata?: any): Promise<{ user: MockUser | null; error: any }> {
    if (this.users.has(email)) {
      return {
        user: null,
        error: { message: '이미 존재하는 이메일입니다.' }
      };
    }

    const newUser: MockUser = {
      id: `user-${Date.now()}`,
      email,
      name: metadata?.name || email.split('@')[0],
      role: 'user'
    };

    this.users.set(email, { password, user: newUser });
    this.currentUser = newUser;

    // 로컬 스토리지에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('mockAuthUser', JSON.stringify(this.currentUser));
    }

    return { user: newUser, error: null };
  }

  async signOut(): Promise<{ error: any }> {
    this.currentUser = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mockAuthUser');
    }

    return { error: null };
  }

  async getSession(): Promise<{ session: any | null }> {
    // 로컬 스토리지에서 복원
    if (typeof window !== 'undefined' && !this.currentUser) {
      const stored = localStorage.getItem('mockAuthUser');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }

    return {
      session: this.currentUser ? {
        user: {
          id: this.currentUser.id,
          email: this.currentUser.email,
          user_metadata: {
            name: this.currentUser.name,
            role: this.currentUser.role
          }
        }
      } : null
    };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    // 초기 세션 체크
    this.getSession().then(({ session }) => {
      if (session) {
        callback('SIGNED_IN', session);
      }
    });

    return {
      data: { subscription: { unsubscribe: () => {} } }
    };
  }
}

export const mockAuth = new MockAuthService();