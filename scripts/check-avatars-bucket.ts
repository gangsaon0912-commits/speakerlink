import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkAvatarsBucket() {
  console.log('🔍 Checking avatars bucket...')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Environment variables not loaded properly')
    return
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 1. 기존 버킷 목록 확인
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError)
      return
    }
    
    console.log('📋 Existing buckets:')
    buckets?.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`)
    })
    
    // 2. avatars 버킷 확인
    const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars')
    
    if (avatarsBucket) {
      console.log('✅ Avatars bucket exists:', avatarsBucket.name)
      console.log(`  - Public: ${avatarsBucket.public}`)
      console.log(`  - Created: ${avatarsBucket.created_at}`)
    } else {
      console.log('❌ Avatars bucket not found')
      console.log('💡 Please create the avatars bucket in Supabase Dashboard:')
      console.log('   1. Go to Storage in Supabase Dashboard')
      console.log('   2. Click "Create a new bucket"')
      console.log('   3. Name: avatars')
      console.log('   4. Make it public')
      console.log('   5. Click "Create bucket"')
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkAvatarsBucket()
