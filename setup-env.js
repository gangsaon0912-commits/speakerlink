const fs = require('fs');
const path = require('path');

const envContent = `# Supabase Configuration
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://svirppvauqojrpzlddvl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aXJwcHZhdXFvanJwemxkZHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4OTkwMzYsImV4cCI6MjA3MDQ3NTAzNn0.2VgY2ys6MTERdMjKa8FVxff5ZZ6zi47GbNGvf1MaGHA

# Supabase Service Role Key (서버 사이드에서만 사용)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aXJwcHZhdXFvanJwemxkZHZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg5OTAzNiwiZXhwIjoyMDcwNDc1MDM2fQ.AJRpggBD75nfxULGi1vTyrejgervgo23aEoNpYHXQlc
`;

const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local 파일이 성공적으로 생성되었습니다!');
  console.log('📁 파일 위치:', envPath);
} catch (error) {
  console.error('❌ .env.local 파일 생성 중 오류가 발생했습니다:', error);
}
