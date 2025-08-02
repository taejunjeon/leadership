/**
 * AI Leadership 4Dx - Frontend E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('AI Leadership 4Dx Frontend Tests', () => {
  const baseURL = 'http://localhost:3001';

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
  });

  test('홈페이지 로드 및 기본 요소 확인', async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/AI Leadership 4Dx/);
    
    // 메인 제목 확인
    const heading = page.getByRole('heading', { name: /AI Leadership 4Dx/i });
    await expect(heading).toBeVisible();
    
    // 시작하기 버튼 확인
    const startButton = page.getByRole('link', { name: /시작하기/i });
    await expect(startButton).toBeVisible();
  });

  test('네비게이션 메뉴 확인', async ({ page }) => {
    // 로고 확인
    const logo = page.getByText('AI Leadership 4Dx');
    await expect(logo).toBeVisible();
    
    // 메뉴 항목들 확인
    await expect(page.getByRole('link', { name: '홈' })).toBeVisible();
    await expect(page.getByRole('link', { name: '설문' })).toBeVisible();
    await expect(page.getByRole('link', { name: '시각화' })).toBeVisible();
  });

  test('설문 페이지 접근 및 기본 요소 확인', async ({ page }) => {
    // 설문 페이지로 이동
    await page.getByRole('link', { name: '설문' }).click();
    await page.waitForURL('**/survey');
    
    // 설문 제목 확인
    await expect(page.getByRole('heading', { name: /리더십 평가 설문/i })).toBeVisible();
    
    // 진행률 표시 확인
    await expect(page.getByText(/0% 완료/)).toBeVisible();
    
    // 첫 번째 질문 확인
    await expect(page.getByText(/Blake & Mouton Grid/)).toBeVisible();
  });

  test('3D 시각화 페이지 접근', async ({ page }) => {
    // 시각화 페이지로 이동
    await page.getByRole('link', { name: '시각화' }).click();
    await page.waitForURL('**/visualization');
    
    // 페이지 제목 확인
    await expect(page.getByRole('heading', { name: /4D 리더십 시각화/i })).toBeVisible();
    
    // 3D 캔버스 영역 확인
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // 필터 옵션 확인
    await expect(page.getByText('필터 옵션')).toBeVisible();
  });

  test('인증 페이지 접근 및 폼 확인', async ({ page }) => {
    // 로그인 버튼 클릭
    await page.getByRole('link', { name: /로그인/i }).click();
    await page.waitForURL('**/auth');
    
    // 로그인 폼 확인
    await expect(page.getByRole('heading', { name: /로그인/i })).toBeVisible();
    await expect(page.getByPlaceholder(/이메일/i)).toBeVisible();
    await expect(page.getByPlaceholder(/비밀번호/i)).toBeVisible();
    
    // 회원가입 탭 전환
    await page.getByRole('tab', { name: /회원가입/i }).click();
    await expect(page.getByPlaceholder(/이름/i)).toBeVisible();
  });

  test('관리자 대시보드 접근 제한 확인', async ({ page }) => {
    // 직접 관리자 URL 접근 시도
    await page.goto(`${baseURL}/admin/dashboard`);
    
    // 권한 없음 메시지 또는 리다이렉션 확인
    const unauthorizedMessage = page.getByText(/권한이 없습니다|로그인이 필요합니다/);
    const loginPage = page.url().includes('/auth');
    
    expect(await unauthorizedMessage.isVisible() || loginPage).toBeTruthy();
  });

  test('설문 질문 네비게이션 테스트', async ({ page }) => {
    // 설문 페이지로 이동
    await page.goto(`${baseURL}/survey`);
    
    // 첫 번째 질문에서 응답 선택
    await page.getByRole('radio').first().click();
    
    // 다음 버튼 클릭
    await page.getByRole('button', { name: /다음/i }).click();
    
    // 진행률이 업데이트되었는지 확인
    const progress = page.getByText(/완료/);
    await expect(progress).not.toHaveText('0% 완료');
  });

  test('콘솔 에러 체크', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    // 콘솔 에러 리스너 추가
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // 모든 주요 페이지 방문
    const pages = ['/', '/survey', '/visualization', '/auth'];
    
    for (const path of pages) {
      await page.goto(`${baseURL}${path}`);
      await page.waitForLoadState('networkidle');
    }
    
    // 콘솔 에러가 없어야 함
    expect(consoleErrors).toHaveLength(0);
  });

  test('반응형 디자인 테스트', async ({ page }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 홈페이지 확인
    await page.goto(baseURL);
    await expect(page.getByRole('heading', { name: /AI Leadership 4Dx/i })).toBeVisible();
    
    // 태블릿 뷰포트
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: /AI Leadership 4Dx/i })).toBeVisible();
    
    // 데스크톱 뷰포트
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByRole('heading', { name: /AI Leadership 4Dx/i })).toBeVisible();
  });

  test('페이지 로드 성능 테스트', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // 3초 이내에 로드되어야 함
    expect(loadTime).toBeLessThan(3000);
  });
});

// 시각화 페이지 상세 테스트
test.describe('3D 시각화 상세 테스트', () => {
  test('3D 인터랙션 테스트', async ({ page }) => {
    await page.goto('http://localhost:3001/visualization');
    
    // 캔버스 찾기
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // 마우스 드래그로 회전 시뮬레이션
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2);
      await page.mouse.up();
    }
    
    // 필터 적용
    await page.selectOption('select', 'high');
    await page.waitForTimeout(500); // 애니메이션 대기
    
    // 새로고침 버튼 테스트
    await page.getByRole('button', { name: /데이터 새로고침/i }).click();
  });
});

// 설문 완료 플로우 테스트
test.describe('설문 완료 플로우', () => {
  test.skip('전체 설문 완료 시뮬레이션', async ({ page }) => {
    // 43개 질문이 있으므로 시간이 오래 걸림 - 기본적으로 스킵
    await page.goto('http://localhost:3001/survey');
    
    // 모든 질문에 응답
    for (let i = 0; i < 43; i++) {
      // 중간 값(4) 선택
      await page.locator('input[value="4"]').click();
      
      if (i < 42) {
        await page.getByRole('button', { name: /다음/i }).click();
      }
    }
    
    // 완료 버튼 확인
    await expect(page.getByRole('button', { name: /완료/i })).toBeVisible();
  });
});