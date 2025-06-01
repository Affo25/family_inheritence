import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-toastify';

const initialFormData = {
  first_name: '',
  last_name: '',
  email: '',
  image: '',
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
  gender: '',
};

const usePersonStore = create((set, get) => ({
  persons: [],
  marriageRecords: [],
  loading: false,
  error: null,
  formData: { ...initialFormData },
  formErrors: {},
  singlePerson: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  },
  enums: {},
  setField: (field, value) => set(() => ({ [field]: value })),
  setImageFile: (file) => set(() => ({ imageFile: file })),
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
      formErrors: { ...state.formErrors, [Object.keys(data)[0]]: '' },
    })),

  validateForm: () => {
    const errors = {};
    const { formData } = get();

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
      const dataToUse = personData || get().formData;
      
      console.log("Adding customer with data:", dataToUse);

      const formData = new FormData();
      for (const key in dataToUse) {
        if (dataToUse[key] !== undefined && dataToUse[key] !== null) {
          // Handle image separately to ensure file object
          if (key === 'image' && dataToUse.image instanceof File) {
            formData.append('image', dataToUse.image);
          } else if (key !== 'image') {
            // Special handling for parent IDs
            if (key === 'father_id' || key === 'mother_id' || key === 'gr_father_id' || key === 'gr_mother_id') {
              const value = dataToUse[key];
              if (value && value.trim() !== '') {
                formData.append(key, value);
                console.log(`Appending ${key}:`, value);
              }
            } else {
              formData.append(key, dataToUse[key]);
            }
          }
        }
      }
      
      // Log all form data being sent
      console.log("Form data being sent to API:");
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const response = await axios.post('/api/Person', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success) {
        toast.success('Person added successfully!');
        console.log("API response:", response.data);

        // If the API returns the created person, add it to the state
        if (response.data.data) {
          set(state => ({
            persons: [...state.persons, response.data.data],
            loading: false,
            formData: { ...initialFormData },
          }));
        } else {
          // Otherwise refetch the entire list
          const updatedResponse = await axios.get('/api/Person');
          if (updatedResponse.data?.persons) {
            set({
              persons: updatedResponse.data.persons,
              loading: false,
              formData: { ...initialFormData },
            });
          }
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
updateCustomer: async (personId, customData = null) => {
  try {
    const { formData } = get();
    set({ loading: true, error: null });

    // Validate MongoDB ID format
    if (!personId || !/^[0-9a-fA-F]{24}$/.test(personId)) {
      const errorMessage = "Invalid ID format. Must be a valid MongoDB ObjectId.";
      toast.error(errorMessage);
      set({ loading: false, error: errorMessage });
      return false;
    }

    const formPayload = new FormData();

    // Append _id explicitly
    formPayload.append('_id', personId);

    // Use custom data if provided, otherwise use formData from state
    const dataToSend = customData || formData;
    
    // Log the form data for debugging
    console.log("Form data being sent:", dataToSend);
    
    // Explicitly append all fields, including parent IDs
    for (const key in dataToSend) {
      if (dataToSend[key] !== undefined && dataToSend[key] !== null) {
        if (key === 'image' && dataToSend.image instanceof File) {
          formPayload.append('image', dataToSend.image);
        } else if (key !== 'image') {
          // Special handling for parent IDs to ensure they're properly sent
          if (key === 'father_id' || key === 'mother_id') {
            // Convert empty strings to null for MongoDB
            const value = dataToSend[key] === '' ? null : dataToSend[key];
            formPayload.append(key, value !== null ? value : '');
            console.log(`Appending ${key}:`, value);
          } else {
            formPayload.append(key, dataToSend[key]);
          }
        }
      }
    }
    
    // Log the FormData entries for debugging
    for (const pair of formPayload.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
    console.log("Sending request to /api/Person", formPayload);
    
    const response = await axios.put('/api/Person', formPayload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data?.success) {
      toast.success('Person updated successfully!');
      set((state) => ({
        persons: state.persons.map((person) =>
          person._id === personId ? response.data.data : person
        ),
        singlePerson: response.data.data, // Update the singlePerson state with the updated data
        loading: false,
        formData: { ...initialFormData },
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

  fetchCustomers: async ({ page = 1, limit = 10, search = '', aliveOnly = true } = {}) => {
    try {
      console.log('📡 Fetching persons...');
      set({ loading: true, error: null });

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        aliveOnly: String(aliveOnly),
      });
      if (search) params.append('search', search);

      const response = await axios.get(`/api/Person?${params.toString()}`);
      const result = response.data;

      if (result?.success && Array.isArray(result.data?.persons)) {
        set({
          persons: result.data.persons,
          pagination: {
            ...result.data.pagination,
            page: page,
          },
          enums: result.enums || {},
          loading: false,
        });
        console.log('✔️ Persons:', result.data.persons);
      } else {
        set({ persons: [], loading: false });
        console.warn('⚠️ Unexpected response format:', result);
      }
    } catch (error) {
      console.error('❌ Fetch Error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch persons';
      toast.error(errorMessage);
      set({ error: errorMessage, loading: false });
    }
  },

  getuserRecord: async (personId) => {
  try {
    set({ loading: true });

    const response = await axios.get(`/api/MarriageData?id=${personId}`);

    if (response.data?.success && Array.isArray(response.data.record)) {
      const records = response.data.record;
      console.log("server responses",records);
      // Directly set the records from the server response
      set({
        marriageRecords: records,
        loading: false,
        error: null
      });

      console.log('Marriage records updated:', records);
      return records; // returning the array for external use
    } else {
      const errorMessage = response.data?.message || 'No records found';
      toast.error(errorMessage);
      set({ loading: false, error: errorMessage });
      return [];
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Request failed';
    toast.error(errorMessage);
    set({ loading: false, error: errorMessage });
    return [];
  }
},

getSinglePerson: async (personId) => {
  try {
    set({ loading: true, error: null });
    
    const response = await axios.get(`/api/SingleProfile?id=${personId}`);
    
    if (response.data?.success) {
      const personData = response.data.record;
      
      // Update the formData with the retrieved person data
      set({
        loading: false,
        singlePerson: personData
      });
      
      return personData;
    } else {
      const errorMessage = response.data?.message || 'Person not found';
      toast.error(errorMessage);
      set({ loading: false, error: errorMessage });
      return null;
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch person details';
    toast.error(errorMessage);
    console.error('Error fetching person details:', error);
    set({ loading: false, error: errorMessage });
    return null;
  }
}

}));

export default usePersonStore;
