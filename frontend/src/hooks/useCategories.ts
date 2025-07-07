import { useQuery } from 'react-query';
import axios from 'axios';
import { CategoriesResponse } from '../types';

const fetchCategories = async (): Promise<CategoriesResponse> => {
  const response = await axios.get('/api/categories');
  return response.data;
};

export const useCategories = () => {
  return useQuery(
    ['categories'],
    fetchCategories,
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
    }
  );
};

export const useCategory = (id: number) => {
  return useQuery(
    ['category', id],
    async () => {
      const response = await axios.get(`/api/categories/${id}`);
      return response.data;
    },
    {
      enabled: !!id,
      staleTime: 10 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );
}; 