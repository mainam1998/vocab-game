'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnswerButton } from './AnswerButton';
import { useVocabularyGame } from '@/hooks/useVocabularyGame';

export function GameCard() {
  const { gameState, checkAnswer, restartGame, changeLevel, speakWord, showAnswer } = useVocabularyGame();
  const [showingAnswer, setShowingAnswer] = useState(false);

  const handleLevelChange = (level: string) => {
    changeLevel(level);
  };

  const handleShowAnswer = () => {
    setShowingAnswer(true);
    setTimeout(() => {
      setShowingAnswer(false);
    }, 2000);
  };

  const completionPercentage = gameState.totalWords > 0
    ? (gameState.completedWords.length / gameState.totalWords) * 100
    : 0;

  if (gameState.isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-6 flex justify-center items-center h-64">
          <p>Loading vocabulary...</p>
        </CardContent>
      </Card>
    );
  }

  if (gameState.error) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-6 flex flex-col justify-center items-center h-64 gap-4">
          <p className="text-red-500">{gameState.error}</p>
          <Button onClick={() => changeLevel(gameState.level)}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Check if all words are completed
  if (!gameState.currentWord && gameState.completedWords.length > 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-6 flex flex-col justify-center items-center h-64 gap-4">
          <p className="text-xl">Congratulations! You've completed all words in this level!</p>
          <Button onClick={restartGame}>
            Play Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If there are no words available for the selected level
if (gameState.totalWords === 0 && gameState.level) {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="p-6 flex flex-col justify-center items-center h-64 gap-4">
        <p className="text-xl">No words available for level {gameState.level}. Please select another level.</p>
        <Tabs defaultValue={gameState.level} onValueChange={handleLevelChange}>
          <TabsList>
            <TabsTrigger value="A1">A1</TabsTrigger>
            <TabsTrigger value="A2">A2</TabsTrigger>
            <TabsTrigger value="B1">B1</TabsTrigger>
            <TabsTrigger value="B2">B2</TabsTrigger>
            <TabsTrigger value="C1">C1</TabsTrigger>
            <TabsTrigger value="C2">C2</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  );
}

  

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6">
        <div className="flex items-center justify-between">
          <CardTitle>English Vocabulary Game</CardTitle>
          <Tabs defaultValue={gameState.level} onValueChange={handleLevelChange}>
            <TabsList>
              <TabsTrigger value="A1">A1</TabsTrigger>
              <TabsTrigger value="A2">A2</TabsTrigger>
              <TabsTrigger value="B1">B1</TabsTrigger>
              <TabsTrigger value="B2">B2</TabsTrigger>
              <TabsTrigger value="C1">C1</TabsTrigger>
              <TabsTrigger value="C2">C2</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="px-6">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">{gameState.currentWord?.english}</h2>
            <Button
              size="icon"
              variant="outline"
              title="Speak word"
              onClick={() => speakWord(gameState.currentWord?.english || '')}
            >
              🔊
            </Button>
          </div>
          <p className="text-sm text-gray-500">Choose the correct Thai translation</p>
          {showingAnswer && (
            <p className="text-green-500 font-bold mt-2">
              Answer: {gameState.currentWord?.thai}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
  {gameState.options.map((option) => (
    <AnswerButton
      key={option}
      option={option}
      onSelect={checkAnswer}
      currentWord={gameState.currentWord?.english || ''} // ส่งคำศัพท์ปัจจุบันไปเพื่อให้รู้ว่าเปลี่ยนคำศัพท์
    />
  ))}
</div>

      </CardContent>
      <CardFooter className="items-center px-6 flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShowAnswer}>
            Show Answer
          </Button>
          <Button variant="outline" onClick={restartGame}>
            Restart
          </Button>
        </div>
        <div>
          <p className="text-sm text-gray-500">
            Words completed: {gameState.completedWords.length}/{gameState.totalWords}
          </p>
          <Progress className="mt-2" value={completionPercentage} />
        </div>
      </CardFooter>
    </Card>
  );
}
