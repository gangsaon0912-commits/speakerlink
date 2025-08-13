import * as fs from 'fs'
import * as path from 'path'

console.log('🚀 배포 준비 시작...')

// 1. 환경 변수 확인
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]

console.log('📋 환경 변수 확인 중...')
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ 필수 환경 변수 누락: ${envVar}`)
    process.exit(1)
  }
  console.log(`✅ ${envVar}: ${process.env[envVar]?.substring(0, 20)}...`)
}

// 2. 빌드 테스트
console.log('🔨 빌드 테스트 중...')
try {
  const { execSync } = require('child_process')
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ 빌드 성공')
} catch (error) {
  console.error('❌ 빌드 실패:', error)
  process.exit(1)
}

// 3. 정적 파일 확인
const outDir = path.join(process.cwd(), 'out')
if (fs.existsSync(outDir)) {
  const files = fs.readdirSync(outDir)
  console.log(`✅ 정적 파일 생성됨: ${files.length}개 파일`)
} else {
  console.log('⚠️  out 디렉토리가 없습니다. 정적 내보내기가 비활성화되어 있을 수 있습니다.')
}

console.log('🎉 배포 준비 완료!')
console.log('')
console.log('📋 배포 단계:')
console.log('1. GitHub에 코드 푸시')
console.log('2. Netlify에서 새 사이트 생성')
console.log('3. GitHub 저장소 연결')
console.log('4. 환경 변수 설정')
console.log('5. 배포!')
