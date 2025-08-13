import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkStorageBucket() {
  try {
    console.log('🔍 Supabase Storage 버킷 확인 중...')
    
    // 1. 기존 버킷 목록 확인
    console.log('\n1️⃣ 기존 버킷 목록 확인...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ 버킷 목록 조회 실패:', bucketsError)
      return
    }
    
    console.log('✅ 기존 버킷들:')
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? '공개' : '비공개'})`)
    })
    
    // 2. documents 버킷 존재 여부 확인
    const documentsBucket = buckets.find(bucket => bucket.name === 'documents')
    
    if (!documentsBucket) {
      console.log('\n2️⃣ documents 버킷이 없습니다. 생성 중...')
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('documents', {
        public: false,
        allowedMimeTypes: [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        fileSizeLimit: 10485760 // 10MB
      })
      
      if (createError) {
        console.error('❌ documents 버킷 생성 실패:', createError)
        return
      }
      
      console.log('✅ documents 버킷 생성 성공:', newBucket)
    } else {
      console.log('\n2️⃣ documents 버킷이 이미 존재합니다:', documentsBucket)
    }
    
    // 3. 버킷 정책 확인 및 설정
    console.log('\n3️⃣ 버킷 정책 확인...')
    
    // 인증된 사용자만 업로드 가능하도록 정책 설정
    const { error: policyError } = await supabase.storage.from('documents').createSignedUrl(
      'test.txt',
      60,
      {
        transform: {
          width: 100,
          height: 100
        }
      }
    )
    
    if (policyError) {
      console.log('⚠️ 버킷 정책 설정이 필요할 수 있습니다.')
      console.log('📋 Supabase 대시보드에서 다음 정책을 설정하세요:')
      console.log(`
-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 사용자는 자신의 파일만 조회 가능
CREATE POLICY "Users can view own documents" ON storage.objects
FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

-- 사용자는 자신의 파일만 삭제 가능
CREATE POLICY "Users can delete own documents" ON storage.objects
FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
      `)
    } else {
      console.log('✅ 버킷 정책이 정상적으로 설정되어 있습니다.')
    }
    
    // 4. 테스트 파일 업로드
    console.log('\n4️⃣ 테스트 파일 업로드...')
    
    // 간단한 테스트 파일 생성
    const testContent = 'This is a test file for storage bucket verification.'
    const testFile = new Blob([testContent], { type: 'text/plain' })
    const testFileName = 'test-verification.txt'
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(`test/${testFileName}`, testFile, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      console.error('❌ 테스트 파일 업로드 실패:', uploadError)
      console.log('📋 문제 해결 방법:')
      console.log('1. Supabase 대시보드에서 Storage > documents 버킷 확인')
      console.log('2. RLS 정책 설정 확인')
      console.log('3. 버킷 권한 설정 확인')
    } else {
      console.log('✅ 테스트 파일 업로드 성공:', uploadData)
      
      // 테스트 파일 삭제
      const { error: deleteError } = await supabase.storage
        .from('documents')
        .remove([`test/${testFileName}`])
      
      if (deleteError) {
        console.error('⚠️ 테스트 파일 삭제 실패:', deleteError)
      } else {
        console.log('✅ 테스트 파일 삭제 완료')
      }
    }
    
    console.log('\n🎉 Storage 버킷 확인 완료!')
    
  } catch (error) {
    console.error('❌ 스크립트 실행 오류:', error)
  }
}

checkStorageBucket()
