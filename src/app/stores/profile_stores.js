// src/stores/personStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
status: '',
};

const usePersonStore = create(
persist(
  (set, get) => ({
    persons: [],
    filteredPersons: [],
    marriageRecords: [],
    data: [],
    isSearchMode: false,
    searchProfile: false,
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
    searchQuery: {},

    // Basic setters
    setPersons: (newList) => set({ persons: newList }),
    setIsSearchMode: (mode) => set({ isSearchMode: mode }),
    setSearchProfile: (value) => set({ searchProfile: value }),
    setField: (field, value) => set(() => ({ [field]: value })),
    setImageFile: (file) => set(() => ({ imageFile: file })),

    // Form handling
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

    // Search functionality
    setSearchResults: (results) => set({
      filteredPersons: results,
      isSearchMode: true
    }),

    clearSearch: () => set({
      filteredPersons: get().persons,
      isSearchMode: false,
      searchQuery: {}
    }),

    // API operations
    addCustomer: async (personData = null) => {
      try {
        set({ loading: true });
        const dataToUse = personData || get().formData;

        const formData = new FormData();
        for (const key in dataToUse) {
          if (dataToUse[key] !== undefined && dataToUse[key] !== null) {
            if (key === 'image' && dataToUse.image instanceof File) {
              formData.append('image', dataToUse.image);
            } else if (key !== 'image') {
              if (key === 'father_id' || key === 'mother_id' || key === 'gr_father_id' || key === 'gr_mother_id') {
                const value = dataToUse[key];
                if (value && value.trim() !== '') {
                  formData.append(key, value);
                }
              } else {
                formData.append(key, dataToUse[key]);
              }
            }
          }
        }

        const response = await axios.post('/api/Person', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data?.success) {
          toast.success('Person added successfully!');
          if (response.data.data) {
            set(state => ({
              persons: [...state.persons, response.data.data],
              filteredPersons: [...state.filteredPersons, response.data.data],
              loading: false,
              formData: { ...initialFormData },
            }));
          } else {
            const updatedResponse = await axios.get('/api/Person');
            if (updatedResponse.data?.persons) {
              set({
                persons: updatedResponse.data.persons,
                filteredPersons: updatedResponse.data.persons,
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
        set({ error: errorMessage, loading: false });
        return false;
      }
    },

    updateCustomer: async (personId, customData = null) => {
      try {
        const { formData } = get();
        set({ loading: true, error: null });

        if (!personId || !/^[0-9a-fA-F]{24}$/.test(personId)) {
          const errorMessage = "Invalid ID format";
          toast.error(errorMessage);
          set({ loading: false, error: errorMessage });
          return false;
        }

        const formPayload = new FormData();
        formPayload.append('_id', personId);

        const dataToSend = customData || formData;

        for (const key in dataToSend) {
          if (dataToSend[key] !== undefined && dataToSend[key] !== null) {
            if (key === 'image' && dataToSend.image instanceof File) {
              formPayload.append('image', dataToSend.image);
            } else if (key !== 'image') {
              if (key === 'father_id' || key === 'mother_id') {
                const value = dataToSend[key] === '' ? null : dataToSend[key];
                formPayload.append(key, value !== null ? value : '');
              } else {
                formPayload.append(key, dataToSend[key]);
              }
            }
          }
        }

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
            filteredPersons: state.filteredPersons.map((person) =>
              person._id === personId ? response.data.data : person
            ),
            singlePerson: response.data.data,
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
            filteredPersons: state.filteredPersons.filter((person) => person._id !== personId),
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

    fetchCustomers: async ({ page = 1, limit = 10, search = '', aliveOnly = true, status = '' } = {}) => {
      try {
        set({ loading: true, error: null });
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          aliveOnly: String(aliveOnly),
        });
        if (search) params.append('search', search);
        if (status) params.append('status', status);

        const response = await axios.get(`/api/Person?${params.toString()}`);
        const result = response.data;

        if (result?.success && Array.isArray(result.data?.persons)) {
          set({
            persons: result.data.persons,
            filteredPersons: result.data.persons,
            pagination: {
              ...result.data.pagination,
              page: page,
            },
            enums: result.enums || {},
            loading: false,
          });
        } else {
          set({ persons: [], filteredPersons: [], loading: false });
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch persons';
        toast.error(errorMessage);
        set({ error: errorMessage, loading: false });
      }
    },

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
          filteredPersons: response.data.data,
          isSearchMode: true,
          loading: false
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
    
    getuserRecord: async (personId) => {
      try {
        set({ loading: true });
        const response = await axios.get(`/api/MarriageData?id=${personId}`);

        if (response.data?.success && Array.isArray(response.data.record)) {
          set({
            marriageRecords: response.data.record,
            loading: false,
            error: null
          });
          return response.data.record;
        } else {
          const errorMessage = response.data?.message || 'No records found';
          // toast.error(errorMessage);
          set({ loading: false, error: errorMessage });
          return [];
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Request failed';
        // toast.error(errorMessage);
        set({ loading: false, error: errorMessage });
        return [];
      }
    },

    getSinglePerson: async (personId) => {
      try {
        set({ loading: true, error: null });
        const response = await axios.get(`/api/SingleProfile?id=${personId}`);

        if (response.data?.success) {
          set({
            loading: false,
            singlePerson: response.data.record
          });
          return response.data.record;
        } else {
          const errorMessage = response.data?.message || 'Person not found';
          // toast.error(errorMessage);
          set({ loading: false, error: errorMessage });
          return null;
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch person details';
        // toast.error(errorMessage);
        set({ loading: false, error: errorMessage });
        return null;
      }
    },

    getUserChildrenData: async (profileId = null) => {
      try {
        set({ loading: true });
        let url = '/api/userChildren';
        if (profileId) url = `/api/userChildren?id=${profileId}`;

        const response = await axios.get(url);

        if (response.data?.success) {
          const records = Array.isArray(response.data.data)
            ? response.data.data
            : response.data.data ? [response.data.data] : [];

          set({
            data: records,
            loading: false,
            error: null
          });
          return records;
        } else {
          const errorMessage = response.data?.message || 'No records found';
          set({
            data: [],
            loading: false,
            error: errorMessage
          });
          return [];
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Request failed';
        toast.error(errorMessage);
        set({
          loading: false,
          error: errorMessage
        });
        return [];
      }
    },
  }),
  {
    name: 'person-store',
    partialize: (state) => ({
      persons: state.persons,
      enums: state.enums
    }),
  }
)
);

export default usePersonStore;