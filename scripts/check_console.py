#!/usr/bin/env python
"""
AI Leadership 4Dx - 콘솔 메시지 검증 스크립트
Playwright를 사용하여 JavaScript 에러, 네트워크 에러, 경고 메시지를 검증
"""

import asyncio
import sys
from playwright.async_api import async_playwright


async def check_console(url):
    """웹 페이지의 콘솔 메시지를 검증합니다."""
    errors = []
    warnings = []
    network_errors = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        # 콘솔 메시지 리스너
        page.on("console", lambda msg: (
            errors.append(msg.text) if msg.type == "error" 
            else warnings.append(msg.text) if msg.type == "warning"
            else None
        ))
        
        # 네트워크 에러 리스너
        page.on("requestfailed", lambda request: network_errors.append({
            "url": request.url,
            "failure": request.failure
        }))
        
        # 페이지 로드
        try:
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(2000)  # 추가 대기
        except Exception as e:
            print(f"페이지 로드 실패: {e}")
            await browser.close()
            return 1
        
        # 결과 출력
        print(f"\n🔍 콘솔 검증 결과 - {url}")
        print("=" * 60)
        
        # JavaScript 에러
        print(f"\n❌ JavaScript 에러: {len(errors)}개")
        for error in errors[:5]:  # 최대 5개만 표시
            print(f"   - {error}")
        if len(errors) > 5:
            print(f"   ... 그 외 {len(errors) - 5}개")
        
        # 네트워크 에러
        print(f"\n🌐 네트워크 에러: {len(network_errors)}개")
        for error in network_errors[:5]:
            print(f"   - {error['url']}: {error['failure']}")
        if len(network_errors) > 5:
            print(f"   ... 그 외 {len(network_errors) - 5}개")
        
        # 경고 메시지
        print(f"\n⚠️  경고 메시지: {len(warnings)}개")
        for warning in warnings[:5]:
            print(f"   - {warning}")
        if len(warnings) > 5:
            print(f"   ... 그 외 {len(warnings) - 5}개")
        
        # 최종 결과
        print("\n" + "=" * 60)
        if len(errors) == 0 and len(network_errors) == 0:
            print("✅ 콘솔이 깨끗합니다! 에러가 없습니다.")
            result = 0
        else:
            print("❌ 에러가 발견되었습니다. 수정이 필요합니다.")
            result = 1
        
        await browser.close()
        return result


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법: python check_console.py [URL]")
        print("예시: python check_console.py http://localhost:5173")
        sys.exit(1)
    
    url = sys.argv[1]
    exit_code = asyncio.run(check_console(url))
    sys.exit(exit_code)