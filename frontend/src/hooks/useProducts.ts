import { useQuery } from 'react-query';
import axios from 'axios';
import { ProductsResponse } from '../types';

interface UseProductsOptions {
  page?: number;
  limit?: number;
  category_id?: string;
  search?: string;
}

const fetchProducts = async (options: UseProductsOptions): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  
  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.category_id) params.append('category_id', options.category_id);
  if (options.search) params.append('search', options.search);
  
  const response = await axios.get(`/api/products?${params.toString()}`);
  return response.data;
};

export const useProducts = (options: UseProductsOptions = {}) => {
  return useQuery(
    ['products', options],
    () => fetchProducts(options),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    }
  );
};

export const useProduct = (id: number) => {
  return useQuery(
    ['product', id],
    async () => {
      const response = await axios.get(`/api/products/${id}`);
      return response.data;
    },
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
}; 