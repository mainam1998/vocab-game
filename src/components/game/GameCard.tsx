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
        <CardContent className="p-4 sm:p-6 flex justify-center items-center h-64">
          <p className="text-sm sm:text-base">Loading vocabulary...</p>
        </CardContent>
      </Card>
    );
  }

  if (gameState.error) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-4 sm:p-6 flex flex-col justify-center items-center h-64 gap-3">
          <p className="text-red-500 text-sm sm:text-base text-center">{gameState.error}</p>
          <Button onClick={() => changeLevel(gameState.level)} className="text-sm sm:text-base">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!gameState.currentWord && gameState.completedWords.length > 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-4 sm:p-6 flex flex-col justify-center items-center h-64 gap-3">
          <p className="text-lg sm:text-xl text-center">Congratulations! You've completed all words in this level!</p>
          <Button onClick={restartGame} className="text-sm sm:text-base">
            Play Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState.totalWords === 0 && gameState.level) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-4 sm:p-6 flex flex-col justify-center items-center h-64 gap-3">
          <p className="text-lg sm:text-xl text-center">No words available for level {gameState.level}. Please select another level.</p>
          <Tabs defaultValue={gameState.level} onValueChange={handleLevelChange}>
            <TabsList className="flex-wrap gap-2">
              <TabsTrigger value="A1" className="text-xs sm:text-sm">A1</TabsTrigger>
              <TabsTrigger value="A2" className="text-xs sm:text-sm">A2</TabsTrigger>
              <TabsTrigger value="B1" className="text-xs sm:text-sm">B1</TabsTrigger>
              <TabsTrigger value="B2" className="text-xs sm:text-sm">B2</TabsTrigger>
              <TabsTrigger value="C1" className="text-xs sm:text-sm">C1</TabsTrigger>
              <TabsTrigger value="C2" className="text-xs sm:text-sm">C2</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <CardTitle className="text-lg sm:text-xl md:text-2xl">English Vocabulary Game</CardTitle>
          <Tabs defaultValue={gameState.level} onValueChange={handleLevelChange}>
            <TabsList className="flex-wrap gap-1">
              <TabsTrigger value="A1" className="text-xs sm:text-sm">A1</TabsTrigger>
              <TabsTrigger value="A2" className="text-xs sm:text-sm">A2</TabsTrigger>
              <TabsTrigger value="B1" className="text-xs sm:text-sm">B1</TabsTrigger>
              <TabsTrigger value="B2" className="text-xs sm:text-sm">B2</TabsTrigger>
              <TabsTrigger value="C1" className="text-xs sm:text-sm">C1</TabsTrigger>
              <TabsTrigger value="C2" className="text-xs sm:text-sm">C2</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-xl sm:text-2xl font-bold">{gameState.currentWord?.english}</h2>
            <Button
              size="icon"
              variant="outline"
              title="Speak word"
              className="h-8 w-8 sm:h-10 sm:w-10"
              onClick={() => speakWord(gameState.currentWord?.english || '')}
            >
              🔊
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">Choose the correct Thai translation</p>
          {showingAnswer && (
            <p className="text-green-500 font-bold mt-2 text-sm sm:text-base">
              Answer: {gameState.currentWord?.thai}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
          {gameState.options.map((option) => (
            <AnswerButton
              key={option}
              option={option}
              onSelect={checkAnswer}
              currentWord={gameState.currentWord?.english || ''}
            />
          ))}
        </div>
      </CardContent>
      <CardFooter className="px-4 sm:px-6 flex flex-col-reverse sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={handleShowAnswer}
            className="text-sm sm:text-base py-1.5 px-3 sm:py-2 sm:px-4"
          >
            Show Answer
          </Button>
          <Button 
            variant="outline" 
            onClick={restartGame}
            className="text-sm sm:text-base py-1.5 px-3 sm:py-2 sm:px-4"
          >
            Restart
          </Button>
        </div>
        <div className="w-full sm:w-auto">
          <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
            Words completed: {gameState.completedWords.length}/{gameState.totalWords}
          </p>
          <Progress className="mt-2 h-2 sm:h-3" value={completionPercentage} />
        </div>
      </CardFooter>
    </Card>
  );
}
