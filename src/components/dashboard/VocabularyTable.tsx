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

  const handleDelete = (word: IVocabulary) => {
    setSelectedWord(word);
    setDeleteDialogOpen(true);
  };

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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>English</TableHead>
              <TableHead>Thai</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vocabularies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No vocabulary items found
                </TableCell>
              </TableRow>
            ) : (
              vocabularies.map((word) => (
                <TableRow key={word._id}>
                  <TableCell>{word.english}</TableCell>
                  <TableCell>{word.thai}</TableCell>
                  <TableCell>{word.level}</TableCell>
                  <TableCell>{word.category || '-'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(word)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500"
                      onClick={() => handleDelete(word)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vocabulary</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-english" className="text-right">
                English
              </label>
              <Input
                id="edit-english"
                className="col-span-3"
                value={editForm.english}
                onChange={(e) => setEditForm({ ...editForm, english: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-thai" className="text-right">
                Thai
              </label>
              <Input
                id="edit-thai"
                className="col-span-3"
                value={editForm.thai}
                onChange={(e) => setEditForm({ ...editForm, thai: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-level" className="text-right">
                Level
              </label>
              <select
                id="edit-level"
                className="col-span-3 border rounded-md px-3 py-2"
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
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-category" className="text-right">
                Category
              </label>
              <Input
                id="edit-category"
                className="col-span-3"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedWord?.english}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
