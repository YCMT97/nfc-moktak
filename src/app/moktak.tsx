// Moktak React component (TypeScript)
// Simple moktak sound player component

'use client'

import React, { useRef, useState, useEffect } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';

export default function Moktak() {
  const [hitCount, setHitCount] = useState<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const [animationData, setAnimationData] = useState(null)
  const [animationError, setAnimationError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Load Lottie animation data
  useEffect(() => {
    const loadAnimation = async () => {
      try {
        setIsLoading(true)
        setAnimationError(null)
        const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/nfc-moktak') ? '/nfc-moktak' : '';
        const response = await fetch(`${basePath}/ani.json`);
        
        if (!response.ok) {
          throw new Error(`애니메이션 파일을 불러올 수 없습니다 (${response.status})`);
        }
        
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error('Failed to load animation:', error);
        setAnimationError(error instanceof Error ? error.message : '애니메이션 로드에 실패했습니다');
      } finally {
        setIsLoading(false)
      }
    };
    
    loadAnimation();
  }, []);
  
  // Use window.location to determine the correct path dynamically
  const getAudioPath = () => {
    if (typeof window !== 'undefined') {
      const basePath = window.location.pathname.startsWith('/nfc-moktak') ? '/nfc-moktak' : '';
      return `${basePath}/tak.mp3`;
    }
    return '/tak.mp3';
  };

  function playMoktak() {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(getAudioPath())
        console.log('Audio path:', getAudioPath()); // 디버깅용
      }
      
      // Reset audio to beginning and play
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((error) => {
        console.warn('Audio play failed:', error)
      })
      
      // Play Lottie animation
      if (lottieRef.current && animationData && !animationError) {
        try {
          lottieRef.current.stop();
          lottieRef.current.play();
        } catch (animError) {
          console.warn('Lottie animation play failed:', animError);
          setAnimationError('애니메이션 재생에 실패했습니다');
        }
      }
    } catch (e) {
      console.warn('Audio error', e)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-xl w-full">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">목탁 소리 재생하기</h1>

        <div className="bg-white shadow-lg rounded-2xl p-5 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 text-center">
            <div className="mx-auto w-48 h-48 flex items-center justify-center">
              {isLoading ? (
                // Loading state
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-500">애니메이션 로딩 중...</p>
                </div>
              ) : animationError ? (
                // Error state
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                  <div className="text-red-500 text-2xl">❌</div>
                  <p className="text-sm text-red-600">{animationError}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    새로고침
                  </button>
                </div>
              ) : animationData ? (
                // Animation loaded successfully
                <Lottie
                  lottieRef={lottieRef}
                  animationData={animationData}
                  autoplay={false}
                  loop={false}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                // Fallback SVG
                <svg viewBox="0 0 200 200" className="w-full h-full" role="img" aria-label="moktak">
                  <defs>
                    <linearGradient id="g1" x1="0" x2="1">
                      <stop offset="0%" stopColor="#8B5E3C" />
                      <stop offset="100%" stopColor="#5A3A22" />
                    </linearGradient>
                  </defs>
                  <g transform="translate(100,100)">
                    <ellipse cx="0" cy="10" rx="70" ry="32" fill="url(#g1)" />
                    <rect x="-60" y="-80" width="120" height="60" rx="10" fill="#b07a4b" />
                    <rect x="-8" y="-90" width="16" height="40" rx="6" fill="#4a2a14" />
                    <circle cx="0" cy="-40" r="10" fill="#3b2314" />
                  </g>
                </svg>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-1">탭 수: {hitCount}</p>
          </div>

          <div className="w-full md:w-48 flex flex-col items-center gap-3">
            <button
              className={`w-full py-3 rounded-xl shadow-sm font-semibold transition-colors ${
                isLoading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              onClick={() => {
                if (!isLoading) {
                  playMoktak()
                  setHitCount((c) => c + 1)
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? '로딩 중...' : '목탁 소리 재생'}
            </button>
            
            {animationError && (
              <p className="text-xs text-red-500 text-center">
                ⚠️ 애니메이션은 작동하지 않지만 소리는 재생됩니다
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-500 bg-white p-3 rounded-lg shadow-inner">
          <strong>설명</strong>
          <ul className="list-disc ml-5 mt-2">
            <li>버튼을 클릭하면 목탁 소리가 재생되고 Lottie 애니메이션이 실행됩니다.</li>
            <li>tak.mp3 파일을 재생하여 실제 목탁 소리를 들을 수 있습니다.</li>
            <li>손과 파도 효과가 포함된 목탁 애니메이션을 볼 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
