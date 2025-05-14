import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-toastify';

const useDeathStore = create((set) => ({
  deaths: [],
  loading: false,
  error: null,
  formData: {
    death_date: '',
    death_reason: '',
    death_place: '',
    profile_id: '',
  },
  formErrors: {},

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
      formErrors: { ...state.formErrors, [Object.keys(data)[0]]: '' },
    })),

  validateForm: () => {
    const errors = {};
    const { formData } = useDeathStore.getState();

     // Validate death_date (only if it's a string)
  if (formData.death_date && typeof formData.death_date === 'string') {
    if (formData.death_date.trim() === '') {
      errors.death_date = 'Death date is required';
    }
  } else if (!formData.death_date) {
    errors.death_date = 'Death date is required';
  }
    if (!formData.death_place.trim()) errors.death_place = 'death_place is required';
    if (!formData.death_reason.trim()) errors.death_reason = 'death_reason is required';


    set({ formErrors: errors });
    return Object.keys(errors).length === 0;
  },

  addCustomer: async (personData = null) => {
    try {
      set({ loading: true });

      const dataToUse = personData || useDeathStore.getState().formData;

      const response = await axios.post('/api/Death', dataToUse);
      if (response.data?.success) {
        toast.success('Record added successfully!');

        const updatedResponse = await axios.get('/api/Death');
        if (updatedResponse.data?.deaths) {
          set({
            deaths: updatedResponse.data.deaths,
            loading: false,
            formData: {
                death_date: '',
    death_reason: '',
    death_place: '',
    profile_id: '',
            },
          });
        }
        return true;
      } else {
        const errorMessage = response.data?.message || 'Failed to add Record';
        toast.error(errorMessage);
        set({ error: errorMessage, loading: false });
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add Record';
      toast.error(errorMessage);
      console.error('Error adding record:', error);
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  updateCustomer: async (personId, updatedData) => {
    try {
      set({ loading: true, error: null });

      const response = await axios.put('/api/Death', {
        _id: personId,
        ...updatedData,
      });

      if (response.data?.success) {
        toast.success('Record updated successfully!');
        set((state) => ({
          deaths: state.deaths.map((person) =>
            person._id === personId ? response.data.person : person
          ),
          loading: false,
          formData: {
            death_date: '',
            death_reason: '',
            death_place: '',
            profile_id: '',
          },
        }));
        return true;
      } else {
        const errorMessage = response.data?.message || 'Failed to update record';
        toast.error(errorMessage);
        set({ loading: false, error: errorMessage });
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update record';
      toast.error(errorMessage);
      console.error('Update error:', error);
      set({ loading: false, error: errorMessage });
      return false;
    }
  },

  deleteCustomer: async (personId) => {
    try {
      set({ loading: true });

      const response = await axios.delete(`/api/Death?_id=${personId}`);

      if (response.data?.success) {
        toast.success('Record deleted successfully!');
        set((state) => ({
          deaths: state.deaths.filter((person) => person._id !== personId),
          loading: false,
        }));
        return true;
      } else {
        const errorMessage = response.data?.message || 'Failed to delete Record';
        toast.error(errorMessage);
        set({ loading: false, error: errorMessage });
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete Record';
      toast.error(errorMessage);
      set({ loading: false, error: errorMessage });
      return false;
    }
  },

  fetchCustomers: async () => {
    try {
      set({ loading: true });
      const response = await axios.get('/api/Death');
      if (response.data?.deaths) {
        set({ deaths: response.data.deaths, loading: false });
      } else {
        set({ deaths: [], loading: false });
        console.warn('Unexpected response format:', response.data);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch data';
      toast.error(errorMessage);
      set({ error: errorMessage, loading: false });
    }
  },
}));

export default useDeathStore;
