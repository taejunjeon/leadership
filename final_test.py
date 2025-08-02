#!/usr/bin/env python3
"""
AI Leadership 4Dx - 최종 통합 테스트
"""

import asyncio
from playwright.async_api import async_playwright

async def final_test():
    """최종 통합 테스트"""
    print("\n🚀 AI Leadership 4Dx 최종 테스트")
    print("=" * 50)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        # 콘솔 메시지 수집
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg) if msg.type == 'error' else None)
        
        results = []
        
        # 1. 홈페이지 테스트
        try:
            print("\n1️⃣ 홈페이지 테스트")
            response = await page.goto("http://localhost:3001", timeout=10000)
            if response and response.ok:
                title = await page.title()
                print(f"   ✅ 홈페이지 정상 - 제목: {title}")
                
                # 메인 타이틀 확인
                h1 = await page.query_selector("h1")
                if h1:
                    h1_text = await h1.text_content()
                    print(f"   📌 메인 타이틀: {h1_text}")
                
                results.append(("홈페이지", True))
            else:
                print("   ❌ 홈페이지 접속 실패")
                results.append(("홈페이지", False))
        except Exception as e:
            print(f"   ❌ 홈페이지 에러: {str(e)}")
            results.append(("홈페이지", False))
        
        # 2. 검증 대시보드 테스트
        try:
            print("\n2️⃣ 검증 대시보드 테스트")
            response = await page.goto("http://localhost:3001/dashboard/validation", timeout=10000)
            if response and response.ok:
                await page.wait_for_timeout(2000)  # 데이터 로딩 대기
                
                # 대시보드 타이틀 확인
                h1 = await page.query_selector("h1")
                if h1:
                    h1_text = await h1.text_content()
                    print(f"   ✅ 대시보드 정상 - 타이틀: {h1_text}")
                
                # 통계 카드 확인
                stat_cards = await page.query_selector_all("[class*='rounded-lg'][class*='p-6']")
                print(f"   📊 통계 카드: {len(stat_cards)}개")
                
                results.append(("검증 대시보드", True))
            else:
                print("   ❌ 대시보드 접속 실패")
                results.append(("검증 대시보드", False))
        except Exception as e:
            print(f"   ❌ 대시보드 에러: {str(e)}")
            results.append(("검증 대시보드", False))
        
        # 3. 백엔드 API 테스트
        try:
            print("\n3️⃣ 백엔드 API 테스트")
            response = await page.goto("http://localhost:8000/docs", timeout=10000)
            if response and response.ok:
                title = await page.title()
                print(f"   ✅ API 문서 정상 - 제목: {title}")
                results.append(("백엔드 API", True))
            else:
                print("   ❌ API 문서 접속 실패")
                results.append(("백엔드 API", False))
        except Exception as e:
            print(f"   ❌ API 에러: {str(e)}")
            results.append(("백엔드 API", False))
        
        # 4. 콘솔 에러 확인
        if console_errors:
            print(f"\n⚠️  콘솔 에러 {len(console_errors)}개 발견:")
            for err in console_errors[:3]:
                print(f"   - {err.text}")
        
        # 최종 결과
        print("\n" + "=" * 50)
        print("📊 최종 결과:")
        all_passed = True
        for name, status in results:
            if status:
                print(f"   ✅ {name}")
            else:
                print(f"   ❌ {name}")
                all_passed = False
        
        print("\n💡 접속 정보:")
        print("   - 홈페이지: http://localhost:3001")
        print("   - 검증 대시보드: http://localhost:3001/dashboard/validation")
        print("   - API 문서: http://localhost:8000/docs")
        
        if all_passed:
            print("\n🎉 모든 테스트 통과! 서버가 정상적으로 실행 중입니다.")
        else:
            print("\n⚠️  일부 서비스에 문제가 있습니다.")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(final_test())