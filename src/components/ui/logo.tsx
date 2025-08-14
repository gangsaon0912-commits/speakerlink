import React from 'react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* 책 바인딩 - 그라데이션 효과 */}
        <defs>
          <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="lightbulbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>
        
        {/* 책 바인딩 */}
        <rect x="8" y="12" width="32" height="24" rx="3" fill="url(#bookGradient)" stroke="#1e40af" strokeWidth="1"/>
        
        {/* 책 페이지들 - 더 현실적인 계층 구조 */}
        <rect x="10" y="14" width="28" height="20" rx="1" fill="white" opacity="0.95"/>
        <rect x="12" y="16" width="24" height="16" rx="1" fill="white" opacity="0.9"/>
        <rect x="14" y="18" width="20" height="12" rx="1" fill="white" opacity="0.85"/>
        
        {/* 책 중앙 선 */}
        <line x1="24" y1="14" x2="24" y2="34" stroke="#e5e7eb" strokeWidth="1" opacity="0.6"/>
        
        {/* 전구 본체 */}
        <circle cx="24" cy="22" r="3.5" fill="url(#lightbulbGradient)"/>
        
        {/* 전구 소켓 */}
        <rect x="22.5" y="18" width="3" height="2" rx="0.5" fill="#f97316"/>
        <rect x="23" y="17.5" width="2" height="1" rx="0.25" fill="#f97316"/>
        
        {/* 빛 효과 - 더 자연스러운 방사선 */}
        <g opacity="0.8">
          <path d="M24 18.5 L24 14" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M20.5 20 L17 18.5" stroke="#f97316" strokeWidth="1" strokeLinecap="round"/>
          <path d="M27.5 20 L31 18.5" stroke="#f97316" strokeWidth="1" strokeLinecap="round"/>
          <path d="M19 21.5 L16 22.5" stroke="#f97316" strokeWidth="0.8" strokeLinecap="round"/>
          <path d="M29 21.5 L32 22.5" stroke="#f97316" strokeWidth="0.8" strokeLinecap="round"/>
        </g>
        
        {/* 책 아래 곡선 - 더 부드러운 곡선 */}
        <path d="M6 36 Q24 42 42 36" stroke="url(#bookGradient)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        
        {/* 하이라이트 효과 */}
        <circle cx="22" cy="20" r="1" fill="white" opacity="0.6"/>
      </svg>
    </div>
  )
}

export function LogoWithText({ className = '', size = 'md' }: LogoProps) {
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Logo size={size} />
      <div className={`font-bold tracking-tight ${textSizeClasses[size]}`}>
        <span className="text-blue-800">강사</span>
        <span className="text-orange-500 font-extrabold">ON</span>
        <span className="text-blue-800">스쿨</span>
      </div>
    </div>
  )
}

// 모바일용 작은 로고
export function LogoCompact({ className = '', size = 'sm' }: LogoProps) {
  return (
    <div className={`flex items-center space-x-1.5 ${className}`}>
      <Logo size={size} />
      <div className="font-bold text-sm">
        <span className="text-blue-800">강사</span>
        <span className="text-orange-500">ON</span>
      </div>
    </div>
  )
}
