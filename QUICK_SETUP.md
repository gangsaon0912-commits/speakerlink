# SpeakerLink 빠른 설정 가이드

## 🚀 즉시 시작하기

### 1. .env.local 파일 생성

`speakerlink/` 디렉토리에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://svirppvauqojrpzlddvl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aXJwcHZhdXFvanJwemxkZHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzQ5NzQsImV4cCI6MjA1MDU1MDk3NH0.your_actual_anon_key_here

# Supabase Service Role Key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aXJwcHZhdXFvanJwemxkZHZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk3NDk3NCwiZXhwIjoyMDUwNTUwOTc0fQ.your_actual_service_role_key_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=0kWNMv0MlxgYxj+ESusxcC97tA88pACDuyOiFJ1hApM=

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 2. Supabase API 키 가져오기

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. `svirppvauqojrpzlddvl` 프로젝트 선택
3. **Settings** → **API** 클릭
4. **Project API keys**에서 실제 키들을 복사하여 위의 `your_actual_anon_key_here`와 `your_actual_service_role_key_here` 부분을 교체

### 3. 데이터베이스 마이그레이션

Supabase Dashboard의 **SQL Editor**에서 다음 순서로 실행:

1. **초기 스키마**: `supabase/migrations/000_initial_schema.sql` 내용 복사하여 실행
2. **공지사항 테이블**: `supabase/migrations/001_create_announcements_table.sql` 내용 복사하여 실행

### 4. 개발 서버 실행

```bash
cd speakerlink
pnpm run dev
```

브라우저에서 `http://localhost:3001`로 접속하세요.

## ✅ 확인 사항

### 애플리케이션이 정상 작동하는지 확인:

1. **홈페이지**: 메인 화면이 표시되는지 확인
2. **공지사항**: `/announcements` 페이지에서 샘플 공지사항이 표시되는지 확인
3. **관리자 페이지**: `/admin` 페이지에 접근할 수 있는지 확인

### 문제가 발생하는 경우:

1. **환경 변수 확인**: `.env.local` 파일이 올바른 위치에 있는지 확인
2. **API 키 확인**: Supabase Dashboard에서 올바른 키를 복사했는지 확인
3. **데이터베이스 확인**: 마이그레이션이 성공적으로 실행되었는지 확인

## 🔧 추가 설정

### Storage 버킷 설정 (문서 업로드용)

1. Supabase Dashboard에서 **Storage** 클릭
2. **New bucket** 클릭
3. 버킷 이름: `documents`
4. **Public bucket** 체크
5. **Create bucket** 클릭

### 이메일 설정 (선택사항)

1. **Authentication** → **Email Templates**에서 이메일 템플릿 커스터마이징
2. **Settings** → **Auth**에서 이메일 제공자 설정

## 📱 주요 기능

### 사용자 기능
- ✅ 공지사항 조회
- ✅ 프로필 관리
- ✅ 문서 업로드
- ✅ 프로젝트 조회

### 관리자 기능
- ✅ 공지사항 작성/수정/삭제
- ✅ 프로필 검증 관리
- ✅ 문서 검토
- ✅ 통계 대시보드

## 🎯 다음 단계

1. **사용자 인증 구현**: 로그인/회원가입 기능 완성
2. **프로필 관리**: 강사/기업 프로필 CRUD 기능
3. **프로젝트 매칭**: AI 기반 매칭 알고리즘 구현
4. **결제 시스템**: 안전한 거래 환경 구축

---

**🎉 축하합니다!** SpeakerLink 플랫폼이 성공적으로 설정되었습니다.
