import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-toastify';

const useEducationStore = create((set) => ({
  educations: [],
  loading: false,
  error: null,
  formData: {
    class_name: '',
    year: '',
    institute: '',
    prodile_id: '', // Note: This is intentionally spelled with 'o' to match the API
  },
  formErrors: {},

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
      formErrors: { ...state.formErrors, [Object.keys(data)[0]]: '' },
    })),

  validateForm: () => {
    const errors = {};
    const { formData } = useEducationStore.getState();

    if (!formData.class_name.trim()) errors.class_name = 'Class name is required';
    if (!formData.year.trim()) errors.year = 'Year is required';
    if (!formData.institute.trim()) errors.institute = 'Institute is required';
    if (!formData.prodile_id) errors.prodile_id = 'Please select a person';
    
    set({ formErrors: errors });
    return Object.keys(errors).length === 0;
  },

  addCustomer: async (personData = null) => {
    try {
      set({ loading: true });

      const dataToUse = personData || useEducationStore.getState().formData;

      const response = await axios.post('/api/Education', dataToUse);
      if (response.data?.success) {
        toast.success('Record added successfully!');

        const updatedResponse = await axios.get('/api/Education');
        if (updatedResponse.data?.educations) {
          set({
            educations: updatedResponse.data.educations,
            loading: false,
            formData: {
                class_name: '',
                year: '',
                institute: '',
                prodile_id: '',
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

      const response = await axios.put('/api/Education', {
        _id: personId,
        ...updatedData,
      });

      if (response.data?.success) {
        toast.success('Record updated successfully!');
        set((state) => ({
          educations: state.educations.map((person) =>
            person._id === personId ? response.data.person : person
          ),
          loading: false,
          formData: {
            class_name: '',
            year: '',
            institute: '',
            prodile_id: '',
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

      const response = await axios.delete(`/api/Education?_id=${personId}`);

      if (response.data?.success) {
        toast.success('Record deleted successfully!');
        set((state) => ({
          educations: state.educations.filter((person) => person._id !== personId),
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
      const response = await axios.get('/api/Education');
      if (response.data?.educations) {
        set({ educations: response.data.educations, loading: false });
      } else {
        set({ educations: [], loading: false });
        console.warn('Unexpected response format:', response.data);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch data';
      toast.error(errorMessage);
      set({ error: errorMessage, loading: false });
    }
  },
}));

export default useEducationStore;
