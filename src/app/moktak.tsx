// Moktak React component (TypeScript)
// Simple moktak sound player component

'use client'

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function Moktak() {
  const [hitCount, setHitCount] = useState<number>(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
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
            <motion.div
              key={hitCount}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <svg viewBox="0 0 200 200" className="mx-auto w-48 h-48" role="img" aria-label="moktak">
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
            </motion.div>

            <p className="text-xs text-slate-400 mt-1">탭 수: {hitCount}</p>
          </div>

          <div className="w-full md:w-48 flex flex-col items-center gap-3">
            <button
              className="w-full py-3 bg-blue-600 text-white rounded-xl shadow-sm font-semibold hover:bg-blue-700 transition-colors"
              onClick={() => {
                playMoktak()
                setHitCount((c) => c + 1)
              }}
            >
              목탁 소리 재생
            </button>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-500 bg-white p-3 rounded-lg shadow-inner">
          <strong>설명</strong>
          <ul className="list-disc ml-5 mt-2">
            <li>버튼을 클릭하면 목탁 소리가 재생되고 목탁 SVG가 살짝 확대됩니다.</li>
            <li>tak.mp3 파일을 재생하여 실제 목탁 소리를 들을 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
