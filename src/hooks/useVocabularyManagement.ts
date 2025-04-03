import { useState, useCallback } from 'react';
import axios, { type AxiosError } from 'axios';
import type { IVocabulary } from '@/lib/db/models/vocabulary';

interface VocabularyState {
  vocabularies: IVocabulary[];
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
}

interface ErrorResponse {
  error: string;
}

// Define a type for vocabulary without the _id field
type VocabularyInput = Omit<IVocabulary, '_id'>;

export const useVocabularyManagement = () => {
  const [state, setState] = useState<VocabularyState>({
    vocabularies: [],
    totalPages: 1,
    currentPage: 1,
    isLoading: false,
    error: null,
  });

  // Fetch all vocabulary or filter by level
  const fetchVocabularies = useCallback(async (level?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const url = level ? `/api/vocabulary?level=${level}` : '/api/vocabulary';
      const response = await axios.get(url);
      setState(prev => ({
        ...prev,
        vocabularies: response.data.data,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch vocabularies',
      }));
    }
  }, []);

  // Add a single vocabulary
  const addVocabulary = useCallback(async (vocabulary: VocabularyInput) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await axios.post('/api/vocabulary', vocabulary);
      setState(prev => ({
        ...prev,
        vocabularies: [...prev.vocabularies, response.data.data],
        isLoading: false,
      }));
      return { success: true, data: response.data.data };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Failed to add vocabulary';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Add multiple vocabularies in bulk
  const addBulkVocabularies = useCallback(async (vocabularies: VocabularyInput[]) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await axios.post('/api/vocabulary/bulk', vocabularies);
      // Refresh the list after bulk addition
      await fetchVocabularies();
      return { success: true, data: response.data.data };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Failed to add vocabularies in bulk';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, [fetchVocabularies]);

  // Update a vocabulary
  const updateVocabulary = useCallback(async (id: string, vocabulary: Partial<IVocabulary>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await axios.put(`/api/vocabulary/${id}`, vocabulary);
      setState(prev => ({
        ...prev,
        vocabularies: prev.vocabularies.map(v =>
          v._id === id ? response.data.data : v
        ),
        isLoading: false,
      }));
      return { success: true, data: response.data.data };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Failed to update vocabulary';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Delete a vocabulary
  const deleteVocabulary = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await axios.delete(`/api/vocabulary/${id}`);
      setState(prev => ({
        ...prev,
        vocabularies: prev.vocabularies.filter(v => v._id !== id),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Failed to delete vocabulary';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Delete all vocabularies
  const deleteAllVocabularies = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await axios.delete('/api/vocabulary');
      setState(prev => ({
        ...prev,
        vocabularies: [],
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Failed to delete all vocabularies';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Parse CSV or text data for bulk import
  const parseImportData = useCallback((data: string, level: string): VocabularyInput[] => {
    const lines = data.trim().split('\n');
    const result: VocabularyInput[] = [];

    for (const line of lines) {
      const parts = line.split(',').map(item => item.trim());
      const english = parts[0];
      const thai = parts[1];

      if (english && thai) {
        result.push({
          english,
          thai,
          level: level as IVocabulary['level'],
          category: ''
        });
      }
    }

    return result;
  }, []);

  return {
    state,
    fetchVocabularies,
    addVocabulary,
    addBulkVocabularies,
    updateVocabulary,
    deleteVocabulary,
    deleteAllVocabularies,
    parseImportData,
  };
};
