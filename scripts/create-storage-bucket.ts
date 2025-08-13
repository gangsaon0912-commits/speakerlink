import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createStorageBucket() {
  console.log('🔧 Creating Supabase Storage bucket...')
  
  try {
    // 1. 기존 버킷 확인
    console.log('1️⃣ Checking existing buckets...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError)
      return
    }

    console.log('✅ Existing buckets:', buckets.map(b => b.name))

    // 2. documents 버킷이 이미 있는지 확인
    const documentsBucket = buckets.find(b => b.name === 'documents')
    
    if (documentsBucket) {
      console.log('✅ Documents bucket already exists')
      console.log('📋 Bucket details:', {
        name: documentsBucket.name,
        id: documentsBucket.id,
        public: documentsBucket.public,
        created_at: documentsBucket.created_at
      })
      return
    }

    // 3. documents 버킷 생성
    console.log('2️⃣ Creating documents bucket...')
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

    console.log('✅ Documents bucket created successfully')
    console.log('📋 New bucket details:', {
      name: newBucket.name,
      id: newBucket.id,
      public: newBucket.public,
      created_at: newBucket.created_at
    })

    // 4. RLS 정책 설정 안내
    console.log('\n📝 Next steps:')
    console.log('1. Go to Supabase Dashboard > Storage > Policies')
    console.log('2. Select the "documents" bucket')
    console.log('3. Add the following RLS policies:')
    console.log('')
    console.log('Policy 1 - Allow authenticated users to upload:')
    console.log('Name: Allow authenticated uploads')
    console.log('Operation: INSERT')
    console.log('Target roles: authenticated')
    console.log('Policy: (auth.uid() = owner)')
    console.log('')
    console.log('Policy 2 - Allow authenticated users to view:')
    console.log('Name: Allow authenticated view')
    console.log('Operation: SELECT')
    console.log('Target roles: authenticated')
    console.log('Policy: (auth.uid() = owner)')
    console.log('')
    console.log('Policy 3 - Allow users to update their own files:')
    console.log('Name: Allow authenticated update')
    console.log('Operation: UPDATE')
    console.log('Target roles: authenticated')
    console.log('Policy: (auth.uid() = owner)')
    console.log('')
    console.log('Policy 4 - Allow users to delete their own files:')
    console.log('Name: Allow authenticated delete')
    console.log('Operation: DELETE')
    console.log('Target roles: authenticated')
    console.log('Policy: (auth.uid() = owner)')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

createStorageBucket()
