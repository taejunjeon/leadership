#!/usr/bin/env python3
"""
AI Leadership 4Dx - 검증 대시보드 상세 점검
"""

import asyncio
from playwright.async_api import async_playwright

async def check_dashboard_errors():
    """검증 대시보드 에러 상세 확인"""
    print("\n🔍 검증 대시보드 상세 점검")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        # 콘솔 메시지 수집
        console_messages = []
        page.on("console", lambda msg: console_messages.append({
            'type': msg.type,
            'text': msg.text,
            'location': msg.location
        }))
        
        # 페이지 에러 수집
        page_errors = []
        page.on("pageerror", lambda err: page_errors.append(str(err)))
        
        # 네트워크 에러 수집
        failed_requests = []
        def handle_request_failed(request):
            failed_requests.append({
                'url': request.url,
                'failure': request.failure
            })
        page.on("requestfailed", handle_request_failed)
        
        try:
            print("📡 검증 대시보드 접속 중...")
            response = await page.goto("http://localhost:3001/dashboard/validation", 
                                     timeout=30000, 
                                     wait_until='networkidle')
            
            if response:
                print(f"✅ 응답 받음 - 상태 코드: {response.status}")
                
                if response.status >= 400:
                    # 에러 페이지 내용 확인
                    content = await page.content()
                    if "Error:" in content:
                        error_elem = await page.query_selector("text=/Error:/")
                        if error_elem:
                            error_text = await error_elem.text_content()
                            print(f"\n❌ 페이지 에러: {error_text}")
                    
                    # 에러 스택 트레이스 확인
                    stack_elem = await page.query_selector("pre")
                    if stack_elem:
                        stack_text = await stack_elem.text_content()
                        print(f"\n📋 스택 트레이스:\n{stack_text[:500]}...")
                
                # 콘솔 메시지 분석
                if console_messages:
                    print(f"\n📋 콘솔 메시지 ({len(console_messages)}개):")
                    for msg in console_messages:
                        if msg['type'] == 'error':
                            print(f"   ❌ {msg['text']}")
                        elif msg['type'] == 'warning':
                            print(f"   ⚠️  {msg['text']}")
                
                # 페이지 에러
                if page_errors:
                    print(f"\n🚨 JavaScript 에러:")
                    for err in page_errors[:3]:
                        print(f"   - {err}")
                
                # 실패한 네트워크 요청
                if failed_requests:
                    print(f"\n🌐 실패한 네트워크 요청:")
                    for req in failed_requests[:3]:
                        print(f"   - {req['url']}")
                        print(f"     원인: {req['failure']}")
                
        except Exception as e:
            print(f"❌ 오류 발생: {str(e)}")
            
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(check_dashboard_errors())