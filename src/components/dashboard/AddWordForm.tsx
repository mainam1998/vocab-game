'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { IVocabulary } from '@/lib/db/models/vocabulary';
import { useToast } from '@/hooks/use-toast';

interface AddWordFormProps {
  onAddWord: (word: Omit<IVocabulary, '_id'>) => Promise<{ success: boolean, error?: string }>;
}

export function AddWordForm({ onAddWord }: AddWordFormProps) {
  const [open, setOpen] = useState(false);
  const [english, setEnglish] = useState('');
  const [thai, setThai] = useState('');
  const [level, setLevel] = useState('A1');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!english || !thai) {
      toast({
        title: 'Error',
        description: 'English and Thai translations are required',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onAddWord({
        english,
        thai,
        level: level as IVocabulary['level'],
        category: category || undefined,
      });

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Word added successfully',
        });

        // Reset form
        setEnglish('');
        setThai('');
        setLevel('A1');
        setCategory('');
        setOpen(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to add word',
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Add Word
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Vocabulary</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="english">English Word</Label>
            <Input
              id="english"
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              placeholder="Enter English word"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="thai">Thai Translation</Label>
            <Input
              id="thai"
              value={thai}
              onChange={(e) => setThai(e.target.value)}
              placeholder="Enter Thai translation"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="level">Level</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger id="level">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A1">A1</SelectItem>
                <SelectItem value="A2">A2</SelectItem>
                <SelectItem value="B1">B1</SelectItem>
                <SelectItem value="B2">B2</SelectItem>
                <SelectItem value="C1">C1</SelectItem>
                <SelectItem value="C2">C2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter category"
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Word'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
