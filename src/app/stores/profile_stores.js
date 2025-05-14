import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-toastify';

const usePersonStore = create((set) => ({
  persons: [],
  loading: false,
  error: null,
  formData: {
    first_name: '',
    last_name: '',
    email: '',
    contact: '',
    birth_date: null,
    birth_place: '',
    blood_group: '',
    marital_status: '',
    occupation: '',
    alive: false,
    cnic: '',
    gr_father_id: '',
    gr_mother_id: '',
    mother_id: '',
    father_id: '',
  },
  formErrors: {},

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
      formErrors: { ...state.formErrors, [Object.keys(data)[0]]: '' },
    })),

  validateForm: () => {
    const errors = {};
    const { formData } = usePersonStore.getState();

    if (!formData.first_name.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.contact.trim()) errors.contact = 'Contact is required';
    if (!formData.cnic.trim()) errors.cnic = 'CNIC is required';

    set({ formErrors: errors });
    return Object.keys(errors).length === 0;
  },

  addCustomer: async (personData = null) => {
    try {
      set({ loading: true });

      const dataToUse = personData || usePersonStore.getState().formData;

      const response = await axios.post('/api/Person', dataToUse);
      if (response.data?.success) {
        toast.success('Person added successfully!');

        const updatedResponse = await axios.get('/api/Person');
        if (updatedResponse.data?.persons) {
          set({
            persons: updatedResponse.data.persons,
            loading: false,
            formData: {
              first_name: '',
              last_name: '',
              email: '',
              contact: '',
              birth_date: null,
              birth_place: '',
              blood_group: '',
              marital_status: '',
              occupation: '',
              alive: false,
              cnic: '',
              gr_father_id: '',
              gr_mother_id: '',
              mother_id: '',
              father_id: '',
            },
          });
        }
        return true;
      } else {
        const errorMessage = response.data?.message || 'Failed to add person';
        toast.error(errorMessage);
        set({ error: errorMessage, loading: false });
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add person';
      toast.error(errorMessage);
      console.error('Error adding person:', error);
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  updateCustomer: async (personId, updatedData) => {
    try {
      set({ loading: true, error: null });

      const response = await axios.put('/api/Person', {
        _id: personId,
        ...updatedData,
      });

      if (response.data?.success) {
        toast.success('Person updated successfully!');
        set((state) => ({
          persons: state.persons.map((person) =>
            person._id === personId ? response.data.person : person
          ),
          loading: false,
          formData: {
            first_name: '',
            last_name: '',
            email: '',
            contact: '',
            birth_date: null,
            birth_place: '',
            blood_group: '',
            marital_status: '',
            occupation: '',
            alive: false,
            cnic: '',
            gr_father_id: '',
            gr_mother_id: '',
            mother_id: '',
            father_id: '',
          },
        }));
        return true;
      } else {
        const errorMessage = response.data?.message || 'Failed to update person';
        toast.error(errorMessage);
        set({ loading: false, error: errorMessage });
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update person';
      toast.error(errorMessage);
      console.error('Update error:', error);
      set({ loading: false, error: errorMessage });
      return false;
    }
  },

  deleteCustomer: async (personId) => {
    try {
      set({ loading: true });

      const response = await axios.delete(`/api/Person?_id=${personId}`);

      if (response.data?.success) {
        toast.success('Person deleted successfully!');
        set((state) => ({
          persons: state.persons.filter((person) => person._id !== personId),
          loading: false,
        }));
        return true;
      } else {
        const errorMessage = response.data?.message || 'Failed to delete person';
        toast.error(errorMessage);
        set({ loading: false, error: errorMessage });
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete person';
      toast.error(errorMessage);
      set({ loading: false, error: errorMessage });
      return false;
    }
  },

  fetchCustomers: async () => {
    try {
      console.log('Fetching customers...');
      set({ loading: true });
      const response = await axios.get('/api/Person');
      console.log('Received response:', response);
      if (response.data && response.data.persons && Array.isArray(response.data.persons)) {
        set({ persons: response.data.persons, loading: false });
        toast.success('Persons fetched successfully!');
        console.log('Fetched persons:', response.data.persons);
      } else {
        set({ persons: [], loading: false });
        console.warn('Unexpected response format:', response.data);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch persons';
      toast.error(errorMessage);
      set({ error: errorMessage, loading: false });
    }
  },
}));

export default usePersonStore;
