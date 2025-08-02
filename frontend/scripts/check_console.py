#!/usr/bin/env python3
"""
AI Leadership 4Dx - 콘솔 메시지 검증 스크립트
Playwright를 사용하여 웹 애플리케이션의 콘솔 메시지를 검사합니다.
"""

import asyncio
from playwright.async_api import async_playwright
import sys
from datetime import datetime

async def check_console_messages(url: str = "http://localhost:3001"):
    """웹 페이지의 콘솔 메시지를 검사합니다."""
    
    print(f"🔍 AI Leadership 4Dx 콘솔 검증 시작")
    print(f"📍 URL: {url}")
    print(f"📅 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 50)
    
    async with async_playwright() as p:
        # 브라우저 실행
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        # 콘솔 메시지 수집
        console_messages = {
            'log': [],
            'warning': [],
            'error': []
        }
        
        # 콘솔 이벤트 리스너
        page.on("console", lambda msg: console_messages[msg.type].append({
            'text': msg.text,
            'location': msg.location
        }) if msg.type in console_messages else None)
        
        # 네트워크 에러 감지
        network_errors = []
        page.on("requestfailed", lambda request: network_errors.append({
            'url': request.url,
            'failure': request.failure
        }))
        
        # 페이지 에러 감지
        page_errors = []
        page.on("pageerror", lambda error: page_errors.append(str(error)))
        
        # 테스트할 페이지 목록
        pages_to_test = [
            ('홈페이지', '/'),
            ('설문 페이지', '/survey'),
            ('시각화 페이지', '/visualization'),
            ('인증 페이지', '/auth'),
            ('관리자 대시보드', '/admin/dashboard')
        ]
        
        # 각 페이지 방문 및 검사
        for page_name, path in pages_to_test:
            print(f"\n📄 {page_name} 검사 중... ({path})")
            
            try:
                # 페이지 방문
                response = await page.goto(f"{url}{path}", wait_until="networkidle", timeout=10000)
                
                # 페이지 로드 상태 확인
                if response and response.status >= 400:
                    print(f"  ⚠️  HTTP {response.status} 응답")
                else:
                    print(f"  ✅ 페이지 로드 성공")
                
                # 추가 대기 시간 (동적 콘텐츠 로드)
                await page.wait_for_timeout(2000)
                
            except Exception as e:
                print(f"  ❌ 페이지 로드 실패: {str(e)}")
        
        # 결과 분석
        print("\n" + "=" * 50)
        print("📊 검사 결과 요약")
        print("=" * 50)
        
        # JavaScript 에러
        if console_messages['error']:
            print(f"\n❌ JavaScript 에러: {len(console_messages['error'])}개")
            for i, error in enumerate(console_messages['error'], 1):
                print(f"  {i}. {error['text']}")
                if error['location'].get('url'):
                    print(f"     위치: {error['location']['url']}:{error['location'].get('lineNumber', '?')}")
        else:
            print("\n✅ JavaScript 에러 없음")
        
        # 경고 메시지
        if console_messages['warning']:
            print(f"\n⚠️  경고 메시지: {len(console_messages['warning'])}개")
            for i, warning in enumerate(console_messages['warning'], 1):
                print(f"  {i}. {warning['text']}")
        else:
            print("\n✅ 경고 메시지 없음")
        
        # 네트워크 에러
        if network_errors:
            print(f"\n❌ 네트워크 에러: {len(network_errors)}개")
            for i, error in enumerate(network_errors, 1):
                print(f"  {i}. {error['url']}")
                print(f"     실패 이유: {error['failure']}")
        else:
            print("\n✅ 네트워크 에러 없음")
        
        # 페이지 에러
        if page_errors:
            print(f"\n❌ 페이지 에러: {len(page_errors)}개")
            for i, error in enumerate(page_errors, 1):
                print(f"  {i}. {error}")
        else:
            print("\n✅ 페이지 에러 없음")
        
        # 최종 판정
        print("\n" + "=" * 50)
        total_errors = len(console_messages['error']) + len(network_errors) + len(page_errors)
        total_warnings = len(console_messages['warning'])
        
        if total_errors == 0:
            print("🎉 모든 페이지가 깨끗합니다! 에러가 없습니다.")
        else:
            print(f"⚠️  총 {total_errors}개의 에러를 발견했습니다.")
        
        if total_warnings > 0:
            print(f"📝 {total_warnings}개의 경고가 있지만 큰 문제는 아닙니다.")
        
        await browser.close()
        
        # 에러가 있으면 실패 코드 반환
        return 0 if total_errors == 0 else 1

if __name__ == "__main__":
    # URL 인자 처리
    url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3001"
    
    # 비동기 실행
    exit_code = asyncio.run(check_console_messages(url))
    sys.exit(exit_code)