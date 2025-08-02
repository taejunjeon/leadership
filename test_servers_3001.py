#!/usr/bin/env python3
"""
AI Leadership 4Dx - 서버 상태 및 콘솔 에러 확인
"""

import asyncio
from playwright.async_api import async_playwright

async def check_frontend_with_console():
    """프론트엔드 서버 접속 및 콘솔 메시지 확인"""
    print("\n🔍 프론트엔드 서버 점검 (포트 3001)")
    
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
        
        try:
            # 3001 포트로 접속
            print("📡 http://localhost:3001 접속 시도...")
            response = await page.goto("http://localhost:3001", timeout=30000)
            
            if response:
                print(f"✅ 응답 받음 - 상태 코드: {response.status}")
                
                # 페이지 내용 확인
                title = await page.title()
                print(f"📄 페이지 제목: {title}")
                
                # 잠시 대기하여 더 많은 콘솔 메시지 수집
                await page.wait_for_timeout(2000)
                
                # 콘솔 메시지 분석
                if console_messages:
                    print(f"\n📋 콘솔 메시지 ({len(console_messages)}개):")
                    errors = [m for m in console_messages if m['type'] == 'error']
                    warnings = [m for m in console_messages if m['type'] == 'warning']
                    
                    if errors:
                        print(f"   ❌ 에러: {len(errors)}개")
                        for err in errors[:3]:  # 처음 3개만 표시
                            print(f"      - {err['text']}")
                    
                    if warnings:
                        print(f"   ⚠️  경고: {len(warnings)}개")
                        for warn in warnings[:3]:
                            print(f"      - {warn['text']}")
                
                # 페이지 에러 확인
                if page_errors:
                    print(f"\n🚨 페이지 에러:")
                    for err in page_errors:
                        print(f"   - {err}")
                
                # 검증 대시보드 페이지 테스트
                print("\n📊 검증 대시보드 접속 시도...")
                dashboard_response = await page.goto("http://localhost:3001/dashboard/validation", timeout=10000)
                
                if dashboard_response:
                    print(f"✅ 대시보드 응답 - 상태 코드: {dashboard_response.status}")
                    await page.wait_for_timeout(1000)
                    
                    # 추가 콘솔 메시지 확인
                    new_messages = console_messages[len(console_messages):]
                    if new_messages:
                        print(f"   새로운 콘솔 메시지: {len(new_messages)}개")
                
            else:
                print("❌ 응답 없음")
                
        except Exception as e:
            print(f"❌ 오류 발생: {str(e)}")
            
        finally:
            await browser.close()
            
        # 결과 요약
        print("\n" + "=" * 50)
        print("💡 진단 결과:")
        if response and response.status < 400:
            print("   ✅ 서버는 실행 중")
            if console_messages:
                error_count = len([m for m in console_messages if m['type'] == 'error'])
                if error_count > 0:
                    print(f"   ⚠️  콘솔 에러 {error_count}개 발견 - 수정 필요")
            else:
                print("   ✅ 콘솔 에러 없음")
        else:
            print("   ❌ 서버 응답 문제")

if __name__ == "__main__":
    asyncio.run(check_frontend_with_console())