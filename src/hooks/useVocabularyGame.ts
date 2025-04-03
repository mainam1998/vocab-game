import { useState, useEffect, useCallback } from 'react';
import type { IVocabulary } from '@/lib/db/models/vocabulary';
import axios from 'axios';

export interface GameState {
  currentWord: IVocabulary | null;
  options: string[];
  level: string;
  completedWords: string[];
  totalWords: number;
  isLoading: boolean;
  error: string | null;
}

export const useVocabularyGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentWord: null,
    options: [],
    level: 'A1',
    completedWords: [],
    totalWords: 0,
    isLoading: true,
    error: null,
  });

  const [allWords, setAllWords] = useState<IVocabulary[]>([]);

  // ดึงคำศัพท์จาก API
  const fetchWords = useCallback(async (level: string) => {
    setGameState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await axios.get(`/api/vocabulary?level=${level}`);
      const words = response.data.data;

      setAllWords(words);
      setGameState(prev => ({
        ...prev,
        level,
        totalWords: words.length,
        isLoading: false,
      }));

      if (words.length > 0) {
        nextWord(words, []);
      }
    } catch (error) {
      setGameState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load vocabulary words',
      }));
    }
  }, []);

  // สุ่มคำใหม่
  const nextWord = useCallback((words: IVocabulary[], completed: string[]) => {
    if (words.length === 0) return;

    // กรองคำที่ยังไม่ได้เล่น
    const available = words.filter(word => !completed.includes(word.english));

    if (available.length === 0) {
      setGameState(prev => ({
        ...prev,
        currentWord: null,
        options: [],
        isLoading: false,
      }));
      return;
    }

    // เลือกคำศัพท์ที่ถูกต้องแบบสุ่ม
    const selectedWord = available[Math.floor(Math.random() * available.length)];
    const correctOption = selectedWord.thai;

    // สุ่มคำผิด 3 ตัว
    const incorrectOptions = shuffleArray(
      words
        .filter(word => word.thai !== correctOption) // เอาคำที่ไม่ใช่คำถูกต้อง
        .map(word => word.thai) // เอาเฉพาะคำแปลภาษาไทย
    ).slice(0, 3); // หยิบมา 3 ตัว

    // รวมและสุ่มตัวเลือกทั้งหมด
    const allOptions = shuffleArray([correctOption, ...incorrectOptions]);

    setGameState(prev => ({
      ...prev,
      currentWord: selectedWord,
      options: allOptions,
      isLoading: false,
    }));

    // เล่นเสียง
    speakWord(selectedWord.english);
  }, []);

  // ตรวจสอบคำตอบ
  const checkAnswer = useCallback((selectedOption: string) => {
    const { currentWord } = gameState;
    if (!currentWord) return false;
  
    const isCorrect = selectedOption === currentWord.thai;
  
    if (isCorrect) {
      const updatedCompleted = [...gameState.completedWords, currentWord.english];
      setGameState(prev => ({
        ...prev,
        completedWords: updatedCompleted,
      }));
  
      nextWord(allWords, updatedCompleted);
    }
  
    return isCorrect;
  }, [gameState, nextWord, allWords]); // เพิ่ม nextWord เป็น dependency

  // รีเซ็ตเกม
  const restartGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      completedWords: [],
    }));

    nextWord(allWords, []);
  }, [allWords, nextWord]);

  // เปลี่ยนระดับ
  const changeLevel = useCallback((level: string) => {
    fetchWords(level);
  }, [fetchWords]);

  // อ่านออกเสียงคำศัพท์
  const speakWord = useCallback((word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // แสดงคำตอบ
  const showAnswer = useCallback(() => {
    return gameState.currentWord?.thai || null;
  }, [gameState]);

  // โหลดคำศัพท์เริ่มต้น
  useEffect(() => {
    fetchWords('A1');
  }, [fetchWords]);

  return {
    gameState,
    checkAnswer,
    restartGame,
    changeLevel,
    speakWord,
    showAnswer,
  };
};

// ฟังก์ชันสลับลำดับอาร์เรย์
function shuffleArray<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5);
}
