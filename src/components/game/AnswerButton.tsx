'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnswerButtonProps {
  option: string;
  onSelect: (option: string) => boolean;
  currentWord: string; // คำศัพท์ที่กำลังเล่นอยู่
}

export function AnswerButton({ option, onSelect, currentWord }: AnswerButtonProps) {
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  // รีเซตสถานะทุกครั้งที่คำศัพท์เปลี่ยน
  useEffect(() => {
    setStatus('idle');
  }, [currentWord]);

  const handleClick = () => {
    const isCorrect = onSelect(option);
    setStatus(isCorrect ? 'correct' : 'incorrect');

    // ถ้าคำตอบผิด รีเซตกลับเป็นปกติหลัง 500ms
    if (!isCorrect) {
      setTimeout(() => {
        setStatus('idle');
      }, 500);
    }
  };

  return (
    <Button
      className={cn(
        'h-16 text-lg justify-center transition-all',
        status === 'correct' && 'bg-green-500 text-white',
        status === 'incorrect' && 'bg-red-500 text-white',
        status === 'idle' && 'bg-gray-200 hover:bg-gray-300 text-black'
      )}
      variant="outline"
      onClick={handleClick}
      disabled={status === 'correct'} // ป้องกันการกดซ้ำถ้าถูกต้อง
    >
      {option}
    </Button>
  );
}
