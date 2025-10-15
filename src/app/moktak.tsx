// Moktak React component (TypeScript)
// Simple moktak sound player component

'use client'

import React, { useRef, useState, useEffect } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';

type AnimationType = 'launch' | 'manual' | 'auto';

interface AnimationState {
  data: any;
  loading: boolean;
  error: string | null;
}

export default function Moktak() {
  const [hitCount, setHitCount] = useState<number>(0)
  const manualAudioRef = useRef<HTMLAudioElement | null>(null)
  const autoAudioRef = useRef<HTMLAudioElement | null>(null)
  const launchLottieRef = useRef<LottieRefCurrentProps>(null)
  const manualLottieRef = useRef<LottieRefCurrentProps>(null)
  const autoLottieRef = useRef<LottieRefCurrentProps>(null)
  
  const [animations, setAnimations] = useState<Record<AnimationType, AnimationState>>({
    launch: { data: null, loading: true, error: null },
    manual: { data: null, loading: true, error: null },
    auto: { data: null, loading: true, error: null }
  });
  
  // Load all Lottie animation data
  useEffect(() => {
    const loadAnimations = async () => {
      const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/nfc-moktak') ? '/nfc-moktak' : '';
      const animationFiles = {
        launch: 'launch_ani.json',
        manual: 'manual_ani.json',
        auto: 'auto_ani.json'
      };
      
      for (const [type, filename] of Object.entries(animationFiles)) {
        try {
          const response = await fetch(`${basePath}/${filename}`);
          
          if (!response.ok) {
            throw new Error(`${filename} 파일을 불러올 수 없습니다 (${response.status})`);
          }
          
          const data = await response.json();
          setAnimations(prev => ({
            ...prev,
            [type]: { data, loading: false, error: null }
          }));
        } catch (error) {
          console.error(`Failed to load ${filename}:`, error);
          setAnimations(prev => ({
            ...prev,
            [type]: { 
              data: null, 
              loading: false, 
              error: error instanceof Error ? error.message : `${filename} 로드에 실패했습니다` 
            }
          }));
        }
      }
    };
    
    loadAnimations();
  }, []);
  
  // Use window.location to determine the correct path dynamically
  const getAudioPath = (filename: string) => {
    if (typeof window !== 'undefined') {
      const basePath = window.location.pathname.startsWith('/nfc-moktak') ? '/nfc-moktak' : '';
      return `${basePath}/${filename}`;
    }
    return `/${filename}`;
  };

  // Play animation function
  const playAnimation = (type: AnimationType) => {
    const refs = {
      launch: launchLottieRef,
      manual: manualLottieRef,
      auto: autoLottieRef
    };
    
    const ref = refs[type];
    const animationState = animations[type];
    
    if (ref.current && animationState.data && !animationState.error) {
      try {
        ref.current.stop();
        ref.current.play();
      } catch (animError) {
        console.warn(`${type} animation play failed:`, animError);
      }
    }
  };

  // Play sound function for specific type
  const playSound = (type: AnimationType) => {
    try {
      let audioRef: React.MutableRefObject<HTMLAudioElement | null>;
      let audioFile: string;
      
      if ( type == 'manual') {
        audioRef = manualAudioRef;
        audioFile = 'manual_sound.wav';
      } else {
        audioRef = autoAudioRef;
        audioFile = 'auto_sound.wav';
      }
      
      if (!audioRef.current) {
        audioRef.current = new Audio(getAudioPath(audioFile));
        console.log('Audio path:', getAudioPath(audioFile));
      }
      
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error: any) => {
        console.warn(`${type} audio play failed:`, error);
      });
      
      setHitCount((c) => c + 1);
    } catch (e) {
      console.warn(`${type} audio error:`, e);
    }
  };

  // Launch: Animation only (no sound)
  const playLaunchAnimation = () => {
    playAnimation('launch');
  };

  // Manual: Animation + manual sound
  const playManualAnimationWithSound = () => {
    playAnimation('manual');
    playSound('manual');
  };

  // Auto: Animation + auto sound
  const playAutoAnimationWithSound = () => {
    playAnimation('auto');
    playSound('auto');
  };

  // Check if any animation is still loading
  const isAnyLoading = Object.values(animations).some(anim => anim.loading);

  // Animation component renderer
  const renderAnimation = (type: AnimationType, ref: React.RefObject<LottieRefCurrentProps | null>) => {
    const animationState = animations[type];
    
    if (animationState.loading) {
      return (
        <div className="flex flex-col items-center justify-center space-y-2 h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-xs text-gray-500">로딩 중...</p>
        </div>
      );
    }
    
    if (animationState.error) {
      return (
        <div className="flex flex-col items-center justify-center space-y-2 text-center h-32">
          <div className="text-red-500 text-xl">❌</div>
          <p className="text-xs text-red-600">{animationState.error}</p>
        </div>
      );
    }
    
    if (animationState.data) {
      return (
        <Lottie
          lottieRef={ref}
          animationData={animationState.data}
          autoplay={false}
          loop={false}
          style={{ width: '100%', height: '128px' }}
        />
      );
    }
    
    return (
      <div className="h-32 flex items-center justify-center text-gray-400">
        애니메이션 없음
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-4xl w-full">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">목탁 애니메이션</h1>

        {/* Animation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Launch Animation */}
          <div className="bg-white shadow-lg rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-3 text-center text-blue-600">Launch</h2>
            <div className="mb-4">
              {renderAnimation('launch', launchLottieRef)}
            </div>
            <button
              className={`w-full py-2 rounded-xl font-semibold transition-colors ${
                animations.launch.loading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              onClick={playLaunchAnimation}
              disabled={animations.launch.loading}
            >
              {animations.launch.loading ? '로딩 중...' : 'Launch 재생'}
            </button>
          </div>

          {/* Manual Animation */}
          <div className="bg-white shadow-lg rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-3 text-center text-green-600">Manual</h2>
            <div className="mb-4">
              {renderAnimation('manual', manualLottieRef)}
            </div>
            <button
              className={`w-full py-2 rounded-xl font-semibold transition-colors ${
                animations.manual.loading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              onClick={playManualAnimationWithSound}
              disabled={animations.manual.loading}
            >
              {animations.manual.loading ? '로딩 중...' : 'Manual 재생'}
            </button>
          </div>

          {/* Auto Animation */}
          <div className="bg-white shadow-lg rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-3 text-center text-purple-600">Auto</h2>
            <div className="mb-4">
              {renderAnimation('auto', autoLottieRef)}
            </div>
            <button
              className={`w-full py-2 rounded-xl font-semibold transition-colors ${
                animations.auto.loading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
              onClick={playAutoAnimationWithSound}
              disabled={animations.auto.loading}
            >
              {animations.auto.loading ? '로딩 중...' : 'Auto 재생'}
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 text-xs text-slate-500 bg-white p-4 rounded-lg shadow-inner">
          <strong>사용법</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li><strong>Launch:</strong> 애니메이션만 재생</li>
            <li><strong>Manual:</strong> 애니메이션 + manual_sound.wav 재생</li>
            <li><strong>Auto:</strong> 애니메이션 + auto_sound.wav 재생</li>
            <li>로딩 중이거나 애니메이션 로드에 실패한 경우에도 소리는 정상 재생됩니다.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
