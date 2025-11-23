export function StoreIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="12" fill="#FBBF24"/>
      <path d="M16 24L32 16L48 24V48H16V24Z" fill="#050816" stroke="#F9FAFB" strokeWidth="2"/>
      <rect x="28" y="36" width="8" height="12" fill="#F9FAFB"/>
      <rect x="20" y="28" width="6" height="6" fill="#F9FAFB"/>
      <rect x="38" y="28" width="6" height="6" fill="#F9FAFB"/>
    </svg>
  );
}

export function TargetIcon({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" stroke="#FBBF24" strokeWidth="3"/>
      <circle cx="32" cy="32" r="20" stroke="#FBBF24" strokeWidth="2"/>
      <circle cx="32" cy="32" r="12" stroke="#FBBF24" strokeWidth="2"/>
      <circle cx="32" cy="32" r="4" fill="#FBBF24"/>
    </svg>
  );
}

export function CheckIcon({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" fill="#10B981"/>
      <path d="M20 32L28 40L44 24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function StarIcon({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8L38 24H56L42 36L48 52L32 42L16 52L22 36L8 24H26L32 8Z" fill="#FBBF24"/>
    </svg>
  );
}

export function KakaoIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3C6.477 3 2 6.477 2 10.8C2 13.383 3.58 15.676 6 17.034V21L9.302 19.045C10.151 19.262 11.056 19.4 12 19.4C17.523 19.4 22 15.923 22 11.6C22 7.277 17.523 3 12 3Z" fill="#191919"/>
    </svg>
  );
}

export function AppleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}
