import { create } from 'zustand';
import axios from 'axios';

const useProfileStore = create((set, get) => ({
  profiles: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },

  // Search profiles with filters
  searchProfiles: async (params = {}) => {
    set({ loading: true, error: null });
    
    try {
      // Merge default pagination with new params
      const searchParams = {
        page: get().pagination.page,
        limit: get().pagination.limit,
        ...params,
      };

      // Convert to URL query string
      const queryString = new URLSearchParams(searchParams).toString();
      
      const response = await axios.get(`/api/SearchProfile?${queryString}`);
      
      set({
        profiles: response.data.data,
        pagination: response.data.pagination,
        loading: false,
      });
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message,
        loading: false 
      });
      throw error;
    }
  },

  // Update pagination
  setPagination: (newPagination) => {
    set(state => ({
      pagination: {
        ...state.pagination,
        ...newPagination,
      }
    }));
  },
}));

export default useProfileStore;