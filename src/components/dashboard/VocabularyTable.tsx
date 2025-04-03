'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { IVocabulary } from '@/lib/db/models/vocabulary';
import { useToast } from '@/hooks/use-toast';

interface VocabularyTableProps {
  vocabularies: IVocabulary[];
  onDeleteWord: (id: string) => Promise<{ success: boolean, error?: string }>;
  onUpdateWord: (id: string, data: Partial<IVocabulary>) => Promise<{ success: boolean, error?: string }>;
}

export function VocabularyTable({ vocabularies, onDeleteWord, onUpdateWord }: VocabularyTableProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<IVocabulary | null>(null);
  const [editForm, setEditForm] = useState({
    english: '',
    thai: '',
    level: '',
    category: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  // ฟังก์ชันจัดการการคลิกปุ่ม Edit
  const handleEdit = (word: IVocabulary) => {
    setSelectedWord(word);
    setEditForm({
      english: word.english,
      thai: word.thai,
      level: word.level,
      category: word.category || '',
    });
    setEditDialogOpen(true);
  };

  // ฟังก์ชันจัดการการคลิกปุ่ม Delete
  const handleDelete = (word: IVocabulary) => {
    setSelectedWord(word);
    setDeleteDialogOpen(true);
  };

  // ฟังก์ชันส่งฟอร์มแก้ไข
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWord || !selectedWord._id) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onUpdateWord(selectedWord._id, {
        english: editForm.english,
        thai: editForm.thai,
        level: editForm.level as IVocabulary['level'],
        category: editForm.category || undefined,
      });

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Word updated successfully',
        });
        setEditDialogOpen(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update word',
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
      setIsSubmitting(false);
    }
  };

  // ฟังก์ชันยืนยันการลบ
  const handleDeleteSubmit = async () => {
    if (!selectedWord || !selectedWord._id) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onDeleteWord(selectedWord._id);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Word deleted successfully',
        });
        setDeleteDialogOpen(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete word',
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
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[600px] sm:min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="text-sm sm:text-base">English</TableHead>
              <TableHead className="text-sm sm:text-base">Thai</TableHead>
              <TableHead className="text-sm sm:text-base">Level</TableHead>
              <TableHead className="text-sm sm:text-base">Category</TableHead>
              <TableHead className="text-right text-sm sm:text-base">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vocabularies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 sm:py-6">
                  <p className="text-sm sm:text-base">No vocabulary items found</p>
                </TableCell>
              </TableRow>
            ) : (
              vocabularies.map((word) => (
                <TableRow key={word._id}>
                  <TableCell className="py-2 sm:py-4 text-sm sm:text-base max-w-[150px] truncate">
                    {word.english}
                  </TableCell>
                  <TableCell className="py-2 sm:py-4 text-sm sm:text-base max-w-[150px] truncate">
                    {word.thai}
                  </TableCell>
                  <TableCell className="py-2 sm:py-4 text-sm sm:text-base">
                    {word.level}
                  </TableCell>
                  <TableCell className="py-2 sm:py-4 text-sm sm:text-base max-w-[100px] truncate">
                    {word.category || '-'}
                  </TableCell>
                  <TableCell className="py-2 sm:py-4 text-right">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                        onClick={() => handleEdit(word)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 text-xs sm:text-sm"
                        onClick={() => handleDelete(word)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-[95%] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Vocabulary</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-english" className="text-sm sm:text-base">
                English
              </label>
              <Input
                id="edit-english"
                className="w-full text-sm sm:text-base"
                value={editForm.english}
                onChange={(e) => setEditForm({ ...editForm, english: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-thai" className="text-sm sm:text-base">
                Thai
              </label>
              <Input
                id="edit-thai"
                className="w-full text-sm sm:text-base"
                value={editForm.thai}
                onChange={(e) => setEditForm({ ...editForm, thai: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-level" className="text-sm sm:text-base">
                Level
              </label>
              <select
                id="edit-level"
                className="w-full border rounded-md px-3 py-2 text-sm sm:text-base"
                value={editForm.level}
                onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                required
              >
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-category" className="text-sm sm:text-base">
                Category
              </label>
              <Input
                id="edit-category"
                className="w-full text-sm sm:text-base"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-[95%] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Are you sure you want to delete "{selectedWord?.english}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
