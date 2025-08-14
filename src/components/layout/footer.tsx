import { LogoWithText } from '@/components/ui/logo'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* 로고 및 소개 */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <LogoWithText size="md" />
            </div>
            <p className="text-gray-400 mb-4">
              강사와 기업을 연결하는 AI 기반 매칭 플랫폼
            </p>
            <div className="space-y-1 text-sm text-gray-400">
              <p>사업자번호: 356-90-0211</p>
              <p>대표자: 김은용</p>
              <p>사업장 주소: 경기도 의정부시 평화로 149</p>
              <p>이준리버빌 2동 202호(호원동)</p>
            </div>
          </div>

          {/* 서비스 */}
          <div>
            <h3 className="font-semibold mb-4">서비스</h3>
            <ul className="space-y-2 text-gray-400">
              <li>강사 등록</li>
                              <li>강사공고 찾기</li>
              <li>매칭 서비스</li>
              <li>결제 시스템</li>
            </ul>
          </div>

          {/* 회사 */}
          <div>
            <h3 className="font-semibold mb-4">회사</h3>
            <ul className="space-y-2 text-gray-400">
              <li>소개</li>
              <li>팀</li>
              <li>채용</li>
              <li>뉴스</li>
            </ul>
          </div>

          {/* 지원 */}
          <div>
            <h3 className="font-semibold mb-4">지원</h3>
            <ul className="space-y-2 text-gray-400">
              <li>고객센터</li>
              <li>문의하기</li>
              <li>FAQ</li>
              <li>이용약관</li>
            </ul>
          </div>
        </div>

        {/* 하단 구분선 및 저작권 */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 강사온스쿨. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
