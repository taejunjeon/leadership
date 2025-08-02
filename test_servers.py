#!/usr/bin/env python3
"""
AI Leadership 4Dx - 서버 상태 확인 스크립트
"""

import asyncio
from playwright.async_api import async_playwright
import subprocess
import time
import os

async def check_server_with_playwright(url, server_name):
    """Playwright로 서버 접속 확인"""
    print(f"\n🔍 {server_name} 확인 중: {url}")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        try:
            # 페이지 접속 시도
            response = await page.goto(url, timeout=10000)
            
            if response and response.ok:
                print(f"✅ {server_name} 정상 작동!")
                print(f"   상태 코드: {response.status}")
                
                # 페이지 제목 가져오기
                title = await page.title()
                if title:
                    print(f"   페이지 제목: {title}")
                
                # 콘솔 메시지 확인
                console_messages = []
                page.on("console", lambda msg: console_messages.append(msg))
                await page.wait_for_timeout(1000)
                
                if console_messages:
                    print(f"   콘솔 메시지: {len(console_messages)}개")
                    
                return True
            else:
                print(f"❌ {server_name} 응답 실패")
                if response:
                    print(f"   상태 코드: {response.status}")
                return False
                
        except Exception as e:
            print(f"❌ {server_name} 접속 실패: {str(e)}")
            return False
        finally:
            await browser.close()

async def main():
    print("🚀 AI Leadership 4Dx 서버 상태 점검")
    print("=" * 50)
    
    # 백엔드 서버 확인
    backend_ok = await check_server_with_playwright(
        "http://localhost:8000/docs", 
        "백엔드 API"
    )
    
    # 프론트엔드 서버 확인
    frontend_ok = await check_server_with_playwright(
        "http://localhost:3000", 
        "프론트엔드"
    )
    
    print("\n" + "=" * 50)
    print("📊 점검 결과:")
    print(f"   백엔드: {'✅ 정상' if backend_ok else '❌ 실행 필요'}")
    print(f"   프론트엔드: {'✅ 정상' if frontend_ok else '❌ 실행 필요'}")
    
    if not backend_ok or not frontend_ok:
        print("\n💡 서버 실행 명령:")
        if not backend_ok:
            print("\n백엔드 실행:")
            print("cd /Users/vibetj/coding/leadership/backend")
            print("uvicorn app.main:app --reload --port 8000")
        if not frontend_ok:
            print("\n프론트엔드 실행:")
            print("cd /Users/vibetj/coding/leadership/frontend")
            print("npm run dev")

if __name__ == "__main__":
    asyncio.run(main())