// Moktak React component (TypeScript)
// Simple moktak sound player component

'use client'

import React, { useRef, useState, useEffect } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';

type AnimationType = 'launch' | 'manual' | 'auto';

interface AnimationState {
  data: object | null;
  loading: boolean;
  error: string | null;
}

type AutoPlayState = 'ready' | 'playing' | 'paused';

export default function Moktak() {
  const [hitCount, setHitCount] = useState<number>(0)
  const [showLaunchAnimation, setShowLaunchAnimation] = useState<boolean>(true)
  const [hasShownLaunchAnimation, setHasShownLaunchAnimation] = useState<boolean>(false)
  const [isManualMode, setIsManualMode] = useState<boolean>(true) // true: 수동, false: 자동
  const [autoPlayState, setAutoPlayState] = useState<AutoPlayState>('ready') // 자동 모드 상태
  const [showToast, setShowToast] = useState<boolean>(false) // 토스트 표시 여부
  const [toastMessage, setToastMessage] = useState<string>('') // 토스트 메시지
  const [isAnimationPlaying, setIsAnimationPlaying] = useState<Record<AnimationType, boolean>>({
    launch: false,
    manual: false,
    auto: false
  })
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

  // Auto-play launch animation when loaded
  useEffect(() => {
    if (animations.launch.data && !animations.launch.loading && !animations.launch.error && launchLottieRef.current) {
      // 약간의 지연 후 애니메이션 시작
      const timer = setTimeout(() => {
        if (launchLottieRef.current) {
          setIsAnimationPlaying(prev => ({ ...prev, launch: true }));
          launchLottieRef.current.play();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [animations.launch.data, animations.launch.loading, animations.launch.error]);

  // Use window.location to determine the correct path dynamically
  const getAudioPath = (filename: string) => {
    if (typeof window !== 'undefined') {
      const basePath = window.location.pathname.startsWith('/nfc-moktak') ? '/nfc-moktak' : '';
      return `${basePath}/${filename}`;
    }
    return `/${filename}`;
  };

  const getImagePath = (filename: string) => {
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
        // 애니메이션 시작 상태로 설정
        setIsAnimationPlaying(prev => ({ ...prev, [type]: true }));
        
        ref.current.stop();
        ref.current.play();
      } catch (animError) {
        console.warn(`${type} animation play failed:`, animError);
        // 에러 발생 시 애니메이션 상태를 false로 설정
        setIsAnimationPlaying(prev => ({ ...prev, [type]: false }));
      }
    }
  };

  // Play sound function for specific type
  const playSound = (type: AnimationType) => {
    if ( type == 'launch') return; // No sound for launch

    try {
      const audioRef = type == 'manual' ? manualAudioRef : autoAudioRef;
      const audioFile = type == 'manual' ? 'manual_sound.wav' : 'auto_sound.wav';
      
      if (!audioRef.current) {
        audioRef.current = new Audio(getAudioPath(audioFile));
        console.log('Audio path:', getAudioPath(audioFile));
      }
      
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error: unknown) => {
        console.warn(`${type} audio play failed:`, error);
      });
      
      setHitCount((c) => c + 1);
    } catch (e) {
      console.warn(`${type} audio error:`, e);
    }
  };



  // Manual: Animation + manual sound
  const playManualAnimationWithSound = () => {
    playAnimation('manual');
    playSound('manual');
  };

  // Auto: Animation + auto sound
  const playAutoAnimationWithSound = () => {
    setAutoPlayState('playing');
    playAnimation('auto');
    playSound('auto');
  };

  // Auto pause function
  const pauseAutoPlaying = () => {
    setAutoPlayState('paused');
    // 오디오 일시정지
    if (autoAudioRef.current) {
      autoAudioRef.current.pause();
    }
    // 애니메이션 일시정지
    if (autoLottieRef.current) {
      autoLottieRef.current.pause();
    }
    setIsAnimationPlaying(prev => ({ ...prev, auto: false }));
  };

  // Resume auto playing
  const resumeAutoPlaying = () => {
    setAutoPlayState('playing');
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
        <div className="flex flex-col items-center justify-center space-y-2">
          <img 
            src={getImagePath('images/img_0.png')} 
            alt="목탁" 
            className="object-contain opacity-50"
          />
          <p className="text-xs text-gray-500">로딩 중...</p>
        </div>
      );
    }
    
    if (animationState.error) {
      return (
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <img 
            src={getImagePath('images/img_0.png')} 
            alt="목탁" 
            className="object-contain"
          />
          <p className="text-xs text-red-600">{animationState.error}</p>
        </div>
      );
    }
    
    if (animationState.data) {
      return (
        <div className="relative flex items-center justify-center">
          {/* 기본 이미지 - 애니메이션이 재생되지 않을 때 표시 */}
          <img 
            src={getImagePath('images/img_0.png')} 
            alt="목탁" 
            className={`object-contain absolute transition-opacity duration-300 ${
              isAnimationPlaying[type] ? 'opacity-0' : 'opacity-100'
            }`}
          />
          {/* Lottie 애니메이션 - 원본 크기 사용 */}
          <Lottie
            lottieRef={ref}
            animationData={animationState.data}
            autoplay={false}
            loop={false}
            onComplete={() => {
              // 애니메이션 완료 시 상태를 false로 설정
              setIsAnimationPlaying(prev => ({ ...prev, [type]: false }));
              // 자동 재생 모드의 auto 애니메이션이 완료되면 자동 재생 상태도 종료
              if (type === 'auto' && !isManualMode) {
                setAutoPlayState('ready');
              }
            }}
            style={{ 
              opacity: isAnimationPlaying[type] ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
          />
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center">
        <img 
          src={getImagePath('images/img_0.png')} 
          alt="목탁" 
          className="object-contain"
        />
      </div>
    );
  };

  return (
    <div className="h-screen bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Launch Animation Overlay */}
      {showLaunchAnimation && animations.launch.data && !animations.launch.error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="w-64 h-64">
            <Lottie
              lottieRef={launchLottieRef}
              animationData={animations.launch.data}
              autoplay={false}
              loop={false}
              onComplete={() => {
                // Launch 애니메이션 완료 상태 설정
                setIsAnimationPlaying(prev => ({ ...prev, launch: false }));
                // 애니메이션 완료 후 1초 뒤에 사라지기
                setTimeout(() => {
                  setShowLaunchAnimation(false);
                  if (!hasShownLaunchAnimation) {
                    setHasShownLaunchAnimation(true);
                  }
                }, 1000);
              }}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`h-screen flex flex-col transition-opacity duration-500 overflow-hidden ${
        showLaunchAnimation ? 'opacity-0' : 'opacity-100'
      }`}>
        {/* Header with refresh button */}
        <div className="flex justify-between items-center px-4 pt-4 pb-2">
          <div className="flex items-center">
            <img 
              src={getImagePath('images/logo@2x.png')}
              srcSet={`${getImagePath('images/logo.png')} 1x, ${getImagePath('images/logo@2x.png')} 2x`}
              alt="영천목탁 로고"
              className="h-8 w-auto mr-2"
            />
          </div>
          <button
            onClick={() => {
              if (hitCount > 0) {
                setToastMessage(`${hitCount}번째 울림을 마쳤습니다.`);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
              }
              setHitCount(0);
            }}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="횟수 초기화"
          >
            <img 
              src={getImagePath('images/reset_icon@2x.png')}
              srcSet={`${getImagePath('images/reset_icon.png')} 1x, ${getImagePath('images/reset_icon@2x.png')} 2x`}
              alt="초기화"
              className="w-5 h-5"
            />
          </button>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col px-4 overflow-hidden pb-20">
        <div className="w-full flex flex-col items-center">
          {/* Toggle Button */}
          <div className="mb-6">
            <div className="flex bg-gray-300 rounded-full p-1 shadow-sm">
              <button
                className={`py-2 px-6 rounded-full font-semibold text-white transition-all duration-200 ${
                  isManualMode 
                    ? 'shadow-md' 
                    : 'bg-transparent text-gray-700 hover:text-gray-900'
                }`}
                style={isManualMode ? { backgroundColor: '#684B45' } : {}}
                onClick={() => setIsManualMode(true)}
              >
                수동
              </button>
              <button
                className={`py-2 px-6 rounded-full font-semibold text-white transition-all duration-200 ${
                  !isManualMode 
                    ? 'shadow-md' 
                    : 'bg-transparent text-gray-700 hover:text-gray-900'
                }`}
                style={!isManualMode ? { backgroundColor: '#684B45' } : {}}
                onClick={() => setIsManualMode(false)}
              >
                자동
              </button>
            </div>
          </div>

          {/* Message and Count */}
          <div className="mb-4 text-center">
            {isManualMode ? (
              <>
                <h1 className="text-3xl font-bold mb-2 font-school" style={{ color: '#684B45' }}>목탁! 치기</h1>
                <div className="text-6xl font-bold" style={{ color: '#684B45' }}>{hitCount}</div>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-2 font-school" style={{ color: '#684B45' }}>
                  {autoPlayState === 'playing'
                    ? '마음이 편안해지는 중' 
                    : autoPlayState === 'paused'
                      ? '명상중... 방해금지' 
                      : '울림 자동재생'
                  }
                </h1>
                <div className="text-5xl font-bold" style={{ color: '#684B45' }}>
                  {autoPlayState === 'playing'
                    ? 'Playing' 
                    : autoPlayState === 'paused'
                      ? 'Pause' 
                      : 'Ready'
                  }
                </div>
              </>
            )}
          </div>

          {/* Animation Display - Fixed Height */}
          <div className="flex flex-col items-center h-64 justify-start">
            <div className="flex items-center justify-center mb-4">
              {isManualMode ? (
                <div 
                  className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  onClick={playManualAnimationWithSound}
                >
                  {renderAnimation('manual', manualLottieRef)}
                </div>
              ) : (
                <div>
                  {renderAnimation('auto', autoLottieRef)}
                </div>
              )}
            </div>
            
            {/* Button Area - Fixed Position */}
            <div className="h-16 flex items-center justify-center">
              {!isManualMode && (
                <button
                  className={`px-12 py-4 rounded-full font-bold text-lg transition-colors ${
                    animations.auto.loading 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'text-white shadow-lg hover:opacity-90'
                  }`}
                  style={!animations.auto.loading ? { 
                    backgroundColor: '#684B45'
                  } : {}}
                  onClick={
                    autoPlayState === 'playing'
                      ? pauseAutoPlaying 
                      : autoPlayState === 'paused'
                        ? resumeAutoPlaying 
                        : playAutoAnimationWithSound
                  }
                  disabled={animations.auto.loading}
                >
                  <div className="flex items-center">
                    <span>
                      {animations.auto.loading 
                        ? '로딩 중...' 
                        : autoPlayState === 'playing'
                          ? '일시정지' 
                          : autoPlayState === 'paused'
                            ? '다시재생'
                            : '자동재생'
                      }
                    </span>
                    {!animations.auto.loading && (
                      <img 
                        src={autoPlayState === 'playing' 
                          ? getImagePath('images/pause_icon@2x.png')
                          : getImagePath('images/play_icon@2x.png')
                        }
                        srcSet={autoPlayState === 'playing'
                          ? `${getImagePath('images/pause_icon.png')} 1x, ${getImagePath('images/pause_icon@2x.png')} 2x`
                          : `${getImagePath('images/play_icon.png')} 1x, ${getImagePath('images/play_icon@2x.png')} 2x`
                        }
                        alt={autoPlayState === 'playing' ? '일시정지' : '재생'}
                        className="w-4 h-4 ml-2"
                      />
                    )}
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex space-x-1">
            <a
              href="https://www.instagram.com/moktak_yc/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="인스타그램"
            >
              <img 
                src={getImagePath('images/insta_icon@2x.png')}
                srcSet={`${getImagePath('images/insta_icon.png')} 1x, ${getImagePath('images/insta_icon@2x.png')} 2x`}
                alt="인스타그램"
                className="w-8 h-8"
              />
            </a>
            <a
              href="https://smartstore.naver.com/ycmoktak"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="네이버 스마트스토어"
            >
              <img 
                src={getImagePath('images/naver_icon@2x.png')}
                srcSet={`${getImagePath('images/naver_icon.png')} 1x, ${getImagePath('images/naver_icon@2x.png')} 2x`}
                alt="네이버 스마트스토어"
                className="w-8 h-8"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Toast Message */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gray-200 text-gray-800 px-6 py-4 rounded-2xl shadow-lg animate-fade-in">
            <span className="text-base">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}
