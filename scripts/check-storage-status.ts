import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkStorageStatus() {
  console.log('🔍 Checking Supabase Storage status...')
  
  try {
    // 1. 기존 버킷 확인
    console.log('1️⃣ Checking existing buckets...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError)
      return
    }

    console.log('✅ Existing buckets:', buckets.map(b => ({
      name: b.name,
      id: b.id,
      public: b.public,
      created_at: b.created_at
    })))

    // 2. documents 버킷 확인
    const documentsBucket = buckets.find(b => b.name === 'documents')
    
    if (!documentsBucket) {
      console.log('❌ Documents bucket does not exist')
      console.log('📝 Creating documents bucket...')
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('documents', {
        public: true,
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
        console.error('❌ Error creating bucket:', createError)
        return
      }

      console.log('✅ Documents bucket created successfully:', {
        name: newBucket.name,
        id: newBucket.id,
        public: newBucket.public
      })
    } else {
      console.log('✅ Documents bucket exists:', {
        name: documentsBucket.name,
        id: documentsBucket.id,
        public: documentsBucket.public
      })
    }

    // 3. 기존 파일 확인
    console.log('2️⃣ Checking existing files in documents bucket...')
    const { data: files, error: filesError } = await supabase.storage
      .from('documents')
      .list('', { limit: 100 })

    if (filesError) {
      console.error('❌ Error listing files:', filesError)
    } else {
      console.log('✅ Files in documents bucket:', files?.map(f => ({
        name: f.name,
        size: f.metadata?.size,
        mime_type: f.metadata?.mimetype,
        created_at: f.created_at
      })))
    }

    // 4. 특정 파일 URL 테스트
    console.log('3️⃣ Testing file access...')
    const testFileUrl = 'https://svirppvauqojrpzlddvl.supabase.co/storage/v1/object/public/documents/d0f8748b-bf4a-459e-9b5b-220a764392bc/1755070413182-7mnpfspwqmu.pdf'
    console.log('🔗 Test file URL:', testFileUrl)
    
    try {
      const response = await fetch(testFileUrl)
      console.log('📡 File access test result:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      if (!response.ok) {
        console.log('❌ File access failed - this is why you see 400 error')
      } else {
        console.log('✅ File access successful')
      }
    } catch (error) {
      console.error('❌ File access test error:', error)
    }

    // 5. RLS 정책 확인 안내
    console.log('\n📝 Next steps:')
    console.log('1. Go to Supabase Dashboard > Storage > documents bucket')
    console.log('2. Check if bucket is public')
    console.log('3. Go to Policies tab and ensure RLS is enabled')
    console.log('4. Add the policies from apply-storage-policies.sql')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkStorageStatus()
