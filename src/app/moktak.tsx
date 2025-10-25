// Moktak React component (TypeScript)
// Simple moktak sound player component

'use client'

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';


enum AnimationType {
  launch = 'launch',
  manual = 'manual',
  auto = 'auto',
}

interface AnimationState {
  data: object | null;
  loading: boolean;
  error: string | null;
}

enum PlayState {
  ready = 'ready',
  playing = 'playing',
  paused = 'paused',
  preparing = 'preparing',
}

function getAudioPath(filename: string): string {
  if (typeof window !== 'undefined') {
    const basePath = window.location.pathname.startsWith('/nfc-moktak') ? '/nfc-moktak' : '';
    return `${basePath}/${filename}`;
  }
  return `/${filename}`;
}

function getImagePath(filename: string): string {
  if (typeof window !== 'undefined') {
    const basePath = window.location.pathname.startsWith('/nfc-moktak') ? '/nfc-moktak' : '';
    return `${basePath}/${filename}`;
  }
  return `/${filename}`;
}

export default function Moktak() {
  // Manual: Animation + manual sound
  const playManualAnimationWithSound = () => {
    setPlayState(PlayState.playing);
  };

  // Auto pause function
  const pauseAutoPlaying = () => {
    setPlayState(PlayState.paused);
  };

  // Resume auto playing
  const resumeAutoPlaying = () => {
    setPlayState(PlayState.playing);
  };

  // Animation component renderer
  const renderAnimation = (type: AnimationType, ref: React.RefObject<LottieRefCurrentProps | null>) => {
    const animationState = animations[type];

    if (animationState.loading) {
      return (
        <div className="flex flex-col items-center justify-center space-y-2">
          <Image
            src={getImagePath('images/moktak.png')}
            alt="목탁"
            width={128}
            height={128}
            className="object-contain opacity-50"
            priority
          />
          <p className="text-xs text-gray-500">로딩 중...</p>
        </div>
      );
    }

    if (animationState.error) {
      return (
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <Image
            src={getImagePath('images/moktak.png')}
            alt="목탁"
            width={128}
            height={128}
            className="object-contain"
            priority
          />
          <p className="text-xs text-red-600">{animationState.error}</p>
        </div>
      );
    }

    if (animationState.data) {
      return (
        <div className="relative flex items-center justify-center">
          {/* 기본 이미지 - 애니메이션이 재생되지 않을 때 표시 */}
          <Image
            src={getImagePath('images/moktak.png')}
            alt="목탁"
            width={128}
            height={128}
            className="object-contain absolute opacity-0"
            priority
          />
          {/* Lottie 애니메이션 - 항상 보이게 */}
          <Lottie
            lottieRef={ref}
            animationData={animationState.data}
            autoplay={false}
            loop={false}
            onComplete={() => {
              setIsAnimationPlaying(prev => ({ ...prev, [type]: false }));
              if (isManualModeRef.current && type === AnimationType.manual) {
                setPlayState(PlayState.ready);
              } else if (type === AnimationType.auto) {
                if (!isManualModeRef.current) {
                  setPlayState(PlayState.playing);
                  setTimeout(() => setPlayState(PlayState.ready), 10);
                } else {
                  setPlayState(PlayState.ready);
                }
              } else {
                setPlayState(PlayState.ready);
              }
              console.log('onComplete called for', type);
            }}
            style={{
              opacity: 1,
              transition: 'opacity 0.3s ease'
            }}
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center">
        <Image
          src={getImagePath('images/moktak.png')}
          alt="목탁"
          width={128}
          height={128}
          className="object-contain"
          priority
        />
      </div>
    );
  };
  const [hitCount, setHitCount] = useState<number>(0)
  const [showLaunchAnimation, setShowLaunchAnimation] = useState<boolean>(true)
  const [hasShownLaunchAnimation, setHasShownLaunchAnimation] = useState<boolean>(false)
  const [isManualMode, setIsManualMode] = useState<boolean>(true) // true: 수동, false: 자동
  const [playState, setPlayState] = useState<PlayState>(PlayState.ready) // 재생 상태
  const [showToast, setShowToast] = useState<boolean>(false) // 토스트 표시 여부
  const [toastMessage, setToastMessage] = useState<string>('') // 토스트 메시지
  const [isAnimationPlaying, setIsAnimationPlaying] = useState<Record<AnimationType, boolean>>({
    [AnimationType.launch]: false,
    [AnimationType.manual]: false,
    [AnimationType.auto]: false
  })
  const manualAudioRef = useRef<HTMLAudioElement | null>(null)
  const autoAudioRef = useRef<HTMLAudioElement | null>(null)
  const launchLottieRef = useRef<LottieRefCurrentProps>(null)
  const manualLottieRef = useRef<LottieRefCurrentProps>(null)
  const autoLottieRef = useRef<LottieRefCurrentProps>(null)

  // 최신 상태 추적용 ref
  const playStateRef = useRef(playState);
  const isManualModeRef = useRef(isManualMode);
  useEffect(() => { playStateRef.current = playState; }, [playState]);
  useEffect(() => { isManualModeRef.current = isManualMode; }, [isManualMode]);

  const [animations, setAnimations] = useState<Record<AnimationType, AnimationState>>({
    [AnimationType.launch]: { data: null, loading: true, error: null },
    [AnimationType.manual]: { data: null, loading: true, error: null },
    [AnimationType.auto]: { data: null, loading: true, error: null }
  });

  // Load all Lottie animation data
  useEffect(() => {
    const loadAnimations = async () => {
      const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/nfc-moktak') ? '/nfc-moktak' : '';
      const animationFiles = {
        [AnimationType.launch]: 'launch_ani.json',
        [AnimationType.manual]: 'manual_ani.json',
        [AnimationType.auto]: 'auto_ani.json'
      };

      for (const [type, filename] of Object.entries(animationFiles)) {
        try {
          const response = await fetch(`${basePath}/${filename}`);

          if (!response.ok) {
            throw new Error(`${filename} 파일을 불러올 수 없습니다 (${response.status})`);
          }

          const data = await response.json();
          setAnimations((prev: Record<AnimationType, AnimationState>) => ({
            ...prev,
            [type as AnimationType]: { data, loading: false, error: null }
          }));
        } catch (error) {
          console.error(`Failed to load ${filename}:`, error);
          setAnimations((prev: Record<AnimationType, AnimationState>) => ({
            ...prev,
            [type as AnimationType]: {
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
        setIsAnimationPlaying((prev: Record<AnimationType, boolean>) => ({ ...prev, launch: true }));
        launchLottieRef.current?.play();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [animations.launch.data, animations.launch.loading, animations.launch.error]);

  // Centralized playback/animation control
  useEffect(() => {
    // Manual mode: play manual animation/sound when state is playing
    if (isManualMode) {
      if (playState === PlayState.playing) {
        // Play manual animation
        if (manualLottieRef.current && animations.manual.data && !animations.manual.error) {
          manualLottieRef.current.stop();
          manualLottieRef.current.play();
          setIsAnimationPlaying((prev) => ({ ...prev, manual: true }));
        }
        // Play manual sound
        if (!manualAudioRef.current) {
          manualAudioRef.current = new window.Audio(getAudioPath('manual_sound.wav'));
        }
        manualAudioRef.current.currentTime = 0;
        manualAudioRef.current.play().catch((error: unknown) => {
          console.warn('manual audio play failed:', error);
        });
        setHitCount((c: number) => c + 1);
  } else if (playState === PlayState.ready) {
        // Stop manual animation/sound
        if (manualLottieRef.current) manualLottieRef.current.pause();
        if (manualAudioRef.current) {
          manualAudioRef.current.pause();
          manualAudioRef.current.currentTime = 0;
          manualAudioRef.current.load();
        }
        setIsAnimationPlaying((prev) => ({ ...prev, manual: false }));
      }
    } else {
      // Auto mode
      if (!autoAudioRef.current) {
        autoAudioRef.current = new window.Audio(getAudioPath('auto_sound.wav'));
      }
      const audio = autoAudioRef.current;
      if (playState === PlayState.ready) {
        // ready 상태에서는 오디오 완전 정지 및 초기화
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
          audio.load();
        }
        // 애니메이션도 정지
        if (autoLottieRef.current) autoLottieRef.current.pause();
        setIsAnimationPlaying((prev) => ({ ...prev, auto: false }));
  } else if (playState === PlayState.playing) {
        // Play auto animation
        if (autoLottieRef.current && animations.auto.data && !animations.auto.error) {
          autoLottieRef.current.stop();
          autoLottieRef.current.play();
          setIsAnimationPlaying((prev) => ({ ...prev, auto: true }));
        }
        // Play auto sound
        audio.currentTime = 0;
        audio.play().then(() => {
          setHitCount((c: number) => c + 1);
        }).catch((e: unknown) => console.warn('auto audio play failed:', e));
  } else if (playState === PlayState.paused) {
        // Pause auto animation/sound
        if (autoLottieRef.current) autoLottieRef.current.pause();
        if (audio) audio.pause();
        setIsAnimationPlaying((prev) => ({ ...prev, auto: false }));
      }
    }
    // No cleanup needed
  }, [playState, isManualMode, animations.manual.data, animations.manual.error, animations.auto.data, animations.auto.error]);

  return (
    <div className="h-screen bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Main Content */}
      <div className={`h-screen flex flex-col transition-opacity duration-500 overflow-hidden`}>
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
              <div className="flex rounded-[8px] overflow-hidden shadow-sm" style={{ width: 180, height: 56, background: '#E1DBDA' }}>
                <button
                  className={`flex-1 h-full font-bold text-lg transition-all duration-200 ${isManualMode
                    ? 'bg-[#684B45] text-white'
                    : 'bg-[#E1DBDA] text-[#684B45]'
                    }`}
                  style={{ borderRadius: '8px' }}
                  onClick={() => {
                    setIsManualMode(true);
                    setPlayState(PlayState.ready);
                    // 자동 사운드 즉시 중지
                    if (autoAudioRef.current) {
                      autoAudioRef.current.pause();
                    }
                  }}
                >
                  수동
                </button>
                <button
                  className={`flex-1 h-full font-bold text-lg transition-all duration-200 ${!isManualMode
                    ? 'bg-[#684B45] text-white'
                    : 'bg-[#E1DBDA] text-[#684B45]'
                    }`}
                  style={{ borderRadius: '8px' }}
                  onClick={() => {
                    setIsManualMode(false);
                    setPlayState(PlayState.ready);
                  }}
                >
                  자동
                </button>
              </div>
            </div>

            {/* Message and Count */}
            <div className="mb-4 text-center">
              {isManualMode ? (
                <>
                  <h1 className="text-4xl font-bold mb-2 font-school" style={{ color: '#684B45' }}>목탁! 치기</h1>
                  <div className="text-6xl font-bold" style={{ color: '#684B45' }}>{hitCount}</div>
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-bold mb-2 font-school" style={{ color: '#684B45' }}>
                    {playState === PlayState.playing
                      ? '마음이 편안해지는 중'
                      : playState === PlayState.paused
                        ? '명상중... 방해금지'
                        : '울림 자동재생'
                    }
                  </h1>
                  <div className="text-4xl font-bold" style={{ color: '#684B45' }}>
                    {(playState === PlayState.playing || playState === PlayState.preparing)
                      ? 'Playing'
                      : playState === PlayState.paused
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
                {showLaunchAnimation ?
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
                  :
                  isManualMode ? (
                    <div
                      className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                      onClick={playManualAnimationWithSound}
                    >
                      {renderAnimation(AnimationType.manual, manualLottieRef)}
                    </div>
                  ) : (
                    <div>
                      {renderAnimation(AnimationType.auto, autoLottieRef)}
                    </div>
                  )
                }
              </div>

              {/* Button Area - Fixed Position */}
              <div className="h-16 flex items-center justify-center">
                {!isManualMode && (
                  <button
                    className={`px-12 py-4 rounded-full font-bold text-lg transition-colors ${animations.auto.loading
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'text-white shadow-lg hover:opacity-90'
                      }`}
                    style={!animations.auto.loading ? {
                      backgroundColor: '#684B45'
                    } : {}}
                    onClick={
                      (playState === PlayState.playing || playState === PlayState.preparing)
                        ? pauseAutoPlaying
                        : resumeAutoPlaying
                    }
                    disabled={animations.auto.loading}
                  >
                    <div className="flex items-center">
                      <span>
                        {animations.auto.loading
                          ? '로딩 중...'
                          : (playState === PlayState.playing || playState === PlayState.preparing)
                            ? '일시정지'
                            : playState === PlayState.paused
                              ? '다시재생'
                              : '자동재생'
                        }
                      </span>
                      {!animations.auto.loading && (
                        <img
                          src={(playState === PlayState.playing || playState === PlayState.preparing)
                            ? getImagePath('images/pause_icon@2x.png')
                            : getImagePath('images/play_icon@2x.png')
                          }
                          srcSet={(playState === PlayState.playing || playState === PlayState.preparing)
                            ? `${getImagePath('images/pause_icon.png')} 1x, ${getImagePath('images/pause_icon@2x.png')} 2x`
                            : `${getImagePath('images/play_icon.png')} 1x, ${getImagePath('images/play_icon@2x.png')} 2x`
                          }
                          alt={(playState === PlayState.playing || playState === PlayState.preparing) ? '일시정지' : '재생'}
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
