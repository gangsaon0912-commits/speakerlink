# 강사온스쿨 Netlify 배포 가이드

## 🚀 배포 준비

### 1. 환경 변수 설정
`.env.production` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. 배포 준비 스크립트 실행
```bash
npm run prepare-deploy
```

## 📋 Netlify 배포 단계

### 1. GitHub 저장소 준비
- 모든 코드를 GitHub에 푸시
- `main` 브랜치가 최신 상태인지 확인

### 2. Netlify 사이트 생성
1. [Netlify](https://app.netlify.com/)에 로그인
2. "New site from Git" 클릭
3. GitHub 선택
4. 저장소 선택

### 3. 빌드 설정
- **Build command**: `npm run build`
- **Publish directory**: `out`
- **Node version**: `18`

### 4. 환경 변수 설정
Netlify 대시보드에서 다음 환경 변수를 설정:

| 변수명 | 값 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |

### 5. 배포
- "Deploy site" 클릭
- 배포 완료까지 대기 (약 2-3분)

## 🔧 배포 후 설정

### 1. 도메인 설정
- Netlify에서 제공하는 기본 도메인 사용 또는
- 커스텀 도메인 연결

### 2. Supabase 설정
- Supabase 프로젝트에서 배포된 도메인을 허용 목록에 추가
- Authentication > URL Configuration에서 Site URL 설정

### 3. 환경별 설정
- **개발**: `http://localhost:3001`
- **프로덕션**: 배포된 Netlify URL

## 🐛 문제 해결

### 빌드 실패
```bash
# 로컬에서 빌드 테스트
npm run build
```

### 환경 변수 문제
- Netlify 대시보드에서 환경 변수 재확인
- 변수명 앞뒤 공백 제거

### 라우팅 문제
- `netlify.toml` 파일의 redirects 설정 확인
- Next.js의 `trailingSlash: true` 설정 확인

## 📞 지원

배포 중 문제가 발생하면:
1. Netlify 빌드 로그 확인
2. 로컬 빌드 테스트
3. 환경 변수 재확인
