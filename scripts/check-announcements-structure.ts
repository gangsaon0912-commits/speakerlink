import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAnnouncementsStructure() {
  try {
    console.log('🔍 Checking announcements table structure...')
    
    // 테이블 존재 확인
    const { data: tableExists, error: tableError } = await supabase
      .from('announcements')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Table error:', tableError)
      return
    }
    
    console.log('✅ Table exists')
    
    // 컬럼 정보 확인 (PostgreSQL 정보 스키마 사용)
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'announcements')
      .eq('table_schema', 'public')
    
    if (columnsError) {
      console.error('❌ Columns error:', columnsError)
    } else {
      console.log('📋 Table columns:')
      columns?.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`)
      })
    }
    
    // 기존 데이터 확인
    const { data: existingData, error: dataError } = await supabase
      .from('announcements')
      .select('*')
    
    if (dataError) {
      console.error('❌ Data error:', dataError)
    } else {
      console.log(`📊 Existing records: ${existingData?.length || 0}`)
      if (existingData && existingData.length > 0) {
        console.log('📋 Sample record:', existingData[0])
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking announcements structure:', error)
  }
}

checkAnnouncementsStructure()
