'use client';

import { useState, useEffect } from 'react';
import { AddWordForm } from '@/components/dashboard/AddWordForm';
import { ImportForm } from '@/components/dashboard/ImportForm';
import { VocabularyTable } from '@/components/dashboard/VocabularyTable';
import { useVocabularyManagement } from '@/hooks/useVocabularyManagement';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const {
    state,
    fetchVocabularies,
    addVocabulary,
    addBulkVocabularies,
    updateVocabulary,
    deleteVocabulary,
    deleteAllVocabularies,
    parseImportData,
  } = useVocabularyManagement();

  const [selectedLevel, setSelectedLevel] = useState<string>('All Levels');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchVocabularies(selectedLevel !== 'All Levels' ? selectedLevel : undefined);
  }, [fetchVocabularies, selectedLevel]);

  const filteredVocabularies = searchQuery
    ? state.vocabularies.filter(
        (word) =>
          word.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
          word.thai.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : state.vocabularies;

  const handleRefresh = () => {
    fetchVocabularies(selectedLevel !== 'All Levels' ? selectedLevel : undefined);
  };

  const handleClearAll = async () => {
    setIsClearing(true);

    try {
      const result = await deleteAllVocabularies();

      if (result.success) {
        toast({
          title: 'Success',
          description: 'All vocabulary items have been deleted',
        });

        setConfirmClearOpen(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete vocabulary items',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vocabulary Dashboard</CardTitle>
          <CardDescription>
            Manage your Oxford 3000 CEFR vocabulary list
          </CardDescription>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-4">
              <AddWordForm onAddWord={addVocabulary} />
              <ImportForm
                onImport={addBulkVocabularies}
                parseImportData={parseImportData}
              />
              <Button variant="outline" onClick={handleRefresh}>
                Refresh
              </Button>
            </div>
            <Button
              variant="destructive"
              onClick={() => setConfirmClearOpen(true)}
            >
              Clear All Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="relative w-full max-w-sm">
              <Input
                placeholder="Search vocabulary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-3 pr-10"
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Levels">All Levels</SelectItem>
                <SelectItem value="A1">A1</SelectItem>
                <SelectItem value="A2">A2</SelectItem>
                <SelectItem value="B1">B1</SelectItem>
                <SelectItem value="B2">B2</SelectItem>
                <SelectItem value="C1">C1</SelectItem>
                <SelectItem value="C2">C2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {state.isLoading ? (
            <div className="text-center py-8">Loading vocabulary data...</div>
          ) : state.error ? (
            <div className="text-center py-8 text-red-500">{state.error}</div>
          ) : (
            <VocabularyTable
              vocabularies={filteredVocabularies}
              onDeleteWord={deleteVocabulary}
              onUpdateWord={updateVocabulary}
            />
          )}

          <div className="mt-4 text-right text-sm text-gray-500">
            {filteredVocabularies.length} items found
          </div>
        </CardContent>
      </Card>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All Vocabulary Data</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all vocabulary items? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setConfirmClearOpen(false)}
              disabled={isClearing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={isClearing}
            >
              {isClearing ? 'Clearing...' : 'Clear All Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
