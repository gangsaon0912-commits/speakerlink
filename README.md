# SpeakerLink - 강사 매칭 플랫폼

SpeakerLink는 강사와 기업을 효율적으로 연결하는 AI 기반 매칭 플랫폼입니다.

## 🚀 프로젝트 개요

- **프로젝트명**: SpeakerLink (강사 매칭 플랫폼)
- **개발 목표**: 강사와 기업을 효율적으로 연결하는 양면 플랫폼 구축
- **핵심 기능**: AI 기반 개인화 매칭 알고리즘, 안전한 거래 환경, 모바일 중심 UX

## 🛠 기술 스택

### 프론트엔드
- **웹**: Next.js 15 (App Router)
- **상태관리**: Zustand / React Query
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: Shadcn/ui

### 백엔드
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth
- **실시간**: Supabase Realtime
- **저장소**: Supabase Storage
- **API**: Supabase API + Supabase Edge Functions

### 인프라 & DevOps
- **호스팅**: Netlify (웹) + Supabase (백엔드)
- **CI/CD**: Netlify Build + GitHub Actions
- **CDN**: Netlify Edge
- **모니터링**: Supabase Dashboard + Sentry
- **도메인**: Netlify DNS

## 📁 프로젝트 구조

```
speakerlink/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/          # 관리자 페이지
│   │   ├── login/          # 로그인 페이지
│   │   ├── signup/         # 회원가입 페이지
│   │   └── ...
│   ├── components/         # React 컴포넌트
│   │   ├── ui/            # Shadcn/ui 컴포넌트
│   │   └── layout/        # 레이아웃 컴포넌트
│   └── lib/               # 유틸리티 및 설정
│       ├── supabase.ts    # Supabase 클라이언트
│       ├── store.ts       # Zustand 스토어
│       └── providers.tsx  # React Query Provider
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 결과를 확인하세요.

## 🔐 관리자 기능

- **강사 찾기**: 관리자만 접근 가능한 강사 관리 기능
- **대시보드**: 플랫폼 통계 및 모니터링
- **사용자 관리**: 강사 및 기업 계정 관리
- **프로젝트 관리**: 진행 중인 프로젝트 관리

## 📱 주요 페이지

- **홈페이지**: 플랫폼 소개 및 주요 기능 안내
- **로그인/회원가입**: 사용자 인증
- **관리자 대시보드**: 플랫폼 관리 및 통계
- **강사 관리**: 강사 계정 및 프로필 관리
- **기업 관리**: 기업 계정 및 프로젝트 관리

## 🎨 UI/UX 특징

- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **다크 모드**: 사용자 선호도에 따른 테마 전환
- **접근성**: WCAG 가이드라인 준수
- **성능 최적화**: Next.js 15의 최신 기능 활용

## 🔧 개발 가이드

### 컴포넌트 추가

```bash
npx shadcn@latest add [component-name]
```

### 새로운 페이지 추가

`src/app/` 디렉토리에 새로운 폴더와 `page.tsx` 파일을 생성하세요.

### 상태 관리

Zustand를 사용하여 전역 상태를 관리합니다:

```typescript
import { useAuthStore } from '@/lib/store'

const { user, isAdmin, setUser } = useAuthStore()
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. 이 저장소를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요
