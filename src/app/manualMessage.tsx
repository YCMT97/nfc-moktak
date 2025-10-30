// 수동 모드 메시지 컴포넌트
function ManualModeMessage({ hitCount }: { hitCount: number }) {
  let messages: string[] | null = null;
  if (hitCount >= 10 && hitCount < 20) {
    messages = [
      '잘하고 있어요.',
      '지금 이 순간에 머물러 보세요.'
    ];
  } else if (hitCount >= 20 && hitCount < 30) {
    messages = [
      '조금 더 마음을 모아봐요.',
      '소리에 집중해요.'
    ];
  } else if (hitCount >= 30 && hitCount < 50) {
    messages = [
      '어허, 고수시네요?',
      '이쯤 되면 도 닦는 중...'
    ];
  } else if (hitCount >= 50 && hitCount < 100) {
    messages = [
      '나를 내려놓아 보입니다.'
    ];
  } else if (hitCount >= 100 && hitCount < 108) {
    messages = [
      '와우...',
      '아주 잘하고 있습니다.'
    ];
  } else if (hitCount >= 108) {
    messages = [
      '108번의 마음 내려놓기.',
      '평안하세요.'
    ];
  }
  if (!messages) return null;
  return (
    <div className="flex flex-col items-center justify-center w-full text-center">
      {messages.map((msg, idx) => (
            <span
          key={idx}
              className={`block text-2xl font-school font-semibold text-[#684B45] tracking-tight${idx > 0 ? ' mt-1' : ''}`}
        >
          {msg}
        </span>
      ))}
    </div>
  );
}

export default ManualModeMessage;