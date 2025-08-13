# SpeakerLink 데이터베이스 설정 가이드

## 개요
이 문서는 SpeakerLink 프로젝트의 Supabase 데이터베이스 설정 방법을 설명합니다.

## 1. Supabase 프로젝트 설정

### 1.1 환경 변수 설정
`.env.local` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://svirppvauqojrpzlddvl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 1.2 Supabase CLI 설치 (선택사항)
로컬 개발을 위해 Supabase CLI를 설치할 수 있습니다:

```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
curl -fsSL https://supabase.com/install.sh | sh
```

## 2. 데이터베이스 마이그레이션

### 2.1 수동 실행 (권장)
Supabase Dashboard에서 SQL Editor를 사용하여 다음 순서로 마이그레이션을 실행하세요:

1. **초기 스키마 생성**: `supabase/migrations/000_initial_schema.sql`
2. **공지사항 테이블 생성**: `supabase/migrations/001_create_announcements_table.sql`

### 2.2 CLI 사용 (고급 사용자)
Supabase CLI가 설치되어 있다면:

```bash
# Supabase 프로젝트 연결
supabase link --project-ref svirppvauqojrpzlddvl

# 마이그레이션 실행
supabase db push
```

## 3. 테이블 구조

### 3.1 주요 테이블
- **profiles**: 사용자 기본 정보
- **instructors**: 강사 상세 정보
- **companies**: 기업 상세 정보
- **projects**: 프로젝트 정보
- **applications**: 프로젝트 지원 정보
- **verification_requests**: 프로필 검증 요청
- **documents**: 문서 업로드 관리
- **announcements**: 공지사항

### 3.2 보안 설정
모든 테이블에 Row Level Security (RLS)가 활성화되어 있으며, 적절한 정책이 설정되어 있습니다.

## 4. 샘플 데이터

### 4.1 공지사항 샘플 데이터
공지사항 테이블에는 다음과 같은 샘플 데이터가 포함되어 있습니다:
- SpeakerLink 플랫폼 오픈 안내
- 시스템 점검 안내
- 프로필 검증 시스템 업데이트
- 이용약관 개정 안내

### 4.2 테스트 사용자 생성
관리자 계정을 생성하려면:

```sql
-- 관리자 프로필 생성
INSERT INTO public.profiles (id, email, full_name, user_type, is_verified)
VALUES (
  'your-user-id-here',
  'admin@speakerlink.com',
  '관리자',
  'instructor',
  true
);
```

## 5. 함수 및 트리거

### 5.1 자동 업데이트 트리거
모든 테이블에 `updated_at` 필드가 자동으로 업데이트되는 트리거가 설정되어 있습니다.

### 5.2 조회수 증가 함수
공지사항 조회수 증가를 위한 `increment_view_count()` 함수가 포함되어 있습니다.

## 6. 인덱스 최적화

성능 향상을 위해 다음 인덱스들이 생성되어 있습니다:
- 사용자 타입별 인덱스
- 상태별 인덱스
- 생성일 기준 정렬 인덱스
- 외래키 인덱스

## 7. 문제 해결

### 7.1 연결 오류
- 환경 변수가 올바르게 설정되었는지 확인
- Supabase 프로젝트가 활성 상태인지 확인
- 네트워크 연결 상태 확인

### 7.2 권한 오류
- RLS 정책이 올바르게 설정되었는지 확인
- 사용자 인증 상태 확인
- 서비스 롤 키 사용 여부 확인

### 7.3 마이그레이션 오류
- SQL 문법 오류 확인
- 테이블 중복 생성 오류 확인
- 제약 조건 충돌 확인

## 8. 추가 설정

### 8.1 Storage 버킷 설정
문서 업로드를 위해 Storage 버킷을 생성하고 적절한 정책을 설정하세요.

### 8.2 이메일 템플릿 설정
인증 및 알림 이메일을 위해 이메일 템플릿을 설정할 수 있습니다.

## 9. 모니터링

### 9.1 로그 확인
Supabase Dashboard에서 실시간 로그를 확인할 수 있습니다.

### 9.2 성능 모니터링
쿼리 성능과 연결 상태를 모니터링하세요.

## 10. 백업 및 복구

### 10.1 자동 백업
Supabase는 자동으로 데이터베이스를 백업합니다.

### 10.2 수동 백업
필요시 수동으로 데이터를 내보낼 수 있습니다.

---

이 설정이 완료되면 SpeakerLink 애플리케이션이 정상적으로 작동할 것입니다.
