'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
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

interface ImportFormProps {
  onImport: (data: Omit<IVocabulary, '_id'>[]) => Promise<{ success: boolean, error?: string }>;
  parseImportData: (data: string, level: string) => Omit<IVocabulary, '_id'>[];
}

export function ImportForm({ onImport, parseImportData }: ImportFormProps) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState('');
  const [level, setLevel] = useState('A1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter some data to import',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedData = parseImportData(data, level);

      if (parsedData.length === 0) {
        toast({
          title: 'Error',
          description: 'No valid data to import',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      const result = await onImport(parsedData);

      if (result.success) {
        toast({
          title: 'Success',
          description: `${parsedData.length} words imported successfully`,
        });

        // Reset form
        setData('');
        setOpen(false);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to import words',
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
        <Button variant="outline">
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Import Vocabulary</DialogTitle>
          <DialogDescription>
            Enter vocabulary data in the format: "english,thai" (one per line)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
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
            <Label htmlFor="import-data">Vocabulary Data</Label>
            <Textarea
              id="import-data"
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="hello,สวัสดี&#10;goodbye,ลาก่อน&#10;thank you,ขอบคุณ"
              className="h-[200px]"
              required
            />
          </div>
          <div className="text-sm text-gray-500">
            <p>Example format:</p>
            <pre className="bg-gray-100 p-2 rounded text-xs mt-1">
              hello,สวัสดี<br />
              goodbye,ลาก่อน<br />
              thank you,ขอบคุณ
            </pre>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Importing...' : 'Import Vocabulary'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
