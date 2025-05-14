import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-toastify';

const useRelationshipStore = create((set) => ({
  relationship: [],
  loading: false,
  error: null,
  formData: {
    person1_id: '',
    person2_id: '',
    relationship_type: '',
    status: '',
  },
  formErrors: {},

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
      formErrors: { ...state.formErrors, [Object.keys(data)[0]]: '' },
    })),

  validateForm: () => {
    const errors = {};
    const { formData } = useRelationshipStore.getState();

    if (!formData.person1_id.trim()) errors.person1_id = 'person1_id is required';
    if (!formData.person2_id.trim()) errors.person2_id = 'person2_id is required';
    if (!formData.relationship_type.trim()) errors.relationship_type = 'relationship type is required';
    if (!formData.status.trim()) errors.status = 'status is required';


    set({ formErrors: errors });
    return Object.keys(errors).length === 0;
  },

  addCustomer: async (personData = null) => {
    try {
      set({ loading: true });

      const dataToUse = personData || useRelationshipStore.getState().formData;
      
      // Log the data being sent to the API
      console.log("Sending data to API:", dataToUse);

      const response = await axios.post('/api/Relationship', dataToUse);
      if (response.data?.success) {
        toast.success('Record added successfully!');

        const updatedResponse = await axios.get('/api/Relationship');
        if (updatedResponse.data?.relationship) {
          set({
            relationship: updatedResponse.data.relationship,
            loading: false,
            formData: {
                person1_id: '',
                person2_id: '',
                relationship_type: '',
                status: '',
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

      const dataToSend = {
        _id: personId,
        ...updatedData,
      };
      
      // Log the data being sent to the API
      console.log("Sending update data to API:", dataToSend);
      
      const response = await axios.put('/api/Relationship', dataToSend);

      if (response.data?.success) {
        toast.success('Record updated successfully!');
        set((state) => ({
          relationship: state.relationship.map((person) =>
            person._id === personId ? response.data.person : person
          ),
          loading: false,
          formData: {
            person1_id: '',
            person2_id: '',
            relationship_type: '',
            status: '',
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

      const response = await axios.delete(`/api/Relationship?_id=${personId}`);

      if (response.data?.success) {
        toast.success('Record deleted successfully!');
        set((state) => ({
          relationship: state.relationship.filter((person) => person._id !== personId),
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
       console.log('Fetching reltionships...');
      set({ loading: true });
      const response = await axios.get('/api/Relationship');
      if (response.data?.relationship && Array.isArray(response.data.relationship)) {
        set({ relationship: response.data.relationship, loading: false });
        toast.success('reltionships fetched successfully!');
        console.log('Fetched reltionships:', response.data.relationship);
      } else {
        set({ relationship: [], loading: false });
        console.log("set reltionship",relationship);
        console.warn('Unexpected response format:', response.data);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch data';
      toast.error(errorMessage);
      set({ error: errorMessage, loading: false });
    }
  },
}));

export default useRelationshipStore;
