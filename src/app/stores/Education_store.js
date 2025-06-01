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
    
    set({ formErrors: errors });
    return Object.keys(errors).length === 0;
  },

  addCustomer: async (personData = null) => {
    try {
      set({ loading: true });

      const dataToUse = personData || useEducationStore.getState().formData;
       console.log("construct data",dataToUse);
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

   updateCustomer : async (recordId, updatedData) => {
  try {
    set({ loading: true, error: null });
    
    console.log("Updating education record:", recordId, updatedData);

    // Make sure we're sending the correct _id for MongoDB update
    const dataToSend = {
      _id: recordId, // This is the MongoDB document _id
      ...updatedData
    };
    
    console.log("Sending update data to API:", dataToSend);
    
    const response = await axios.put('/api/Education', dataToSend);

    if (response.data?.success) {
      toast.success('Education record updated successfully!');
      
      // Fetch updated records to ensure we have the latest data
      const updatedResponse = await axios.get(`/api/Education?id=${updatedData.prodile_id}`);
      
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
      } else {
        // If fetch fails, update locally
        set((state) => ({
          educations: state.educations.map((edu) =>
            edu._id === recordId ? { ...edu, ...updatedData } : edu
          ),
          loading: false,
          formData: {
            class_name: '',
            year: '',
            institute: '',
            prodile_id: '',
          },
        }));
      }
      return true;
    } else {
      const errorMessage = response.data?.message || 'Failed to update education record';
      toast.error(errorMessage);
      set({ loading: false, error: errorMessage });
      return false;
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update education record';
    toast.error(errorMessage);
    console.error('Education update error:', error);
    set({ loading: false, error: errorMessage });
    return false;
  }
  },

  deleteCustomer: async (recordId) => {
    try {
      set({ loading: true });
      
      console.log("Deleting education record with ID:", recordId);

      const response = await axios.delete(`/api/Education?_id=${recordId}`);

      if (response.data?.success) {
        toast.success('Education record deleted successfully!');
        
        // Update the local state by filtering out the deleted record
        set((state) => ({
          educations: state.educations.filter((edu) => edu._id !== recordId),
          loading: false,
        }));
        
        console.log("Education record deleted successfully");
        return true;
      } else {
        const errorMessage = response.data?.message || 'Failed to delete education record';
        toast.error(errorMessage);
        set({ loading: false, error: errorMessage });
        console.error("Delete education error:", errorMessage);
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete education record';
      toast.error(errorMessage);
      console.error("Delete education error:", error);
      set({ loading: false, error: errorMessage });
      return false;
    }
  },


  fetchCustomers: async () => {
  try {
    set({ loading: true });

    const response = await axios.get(`/api/Education`);

    if (response.data?.success && Array.isArray(response.data.educations)) {
      const records = response.data.educations;
      console.log("server responses",records);
      // Directly set the records from the server response
      set({
        educations: records,
        loading: false,
        error: null
      });

      console.log('Educations records updated:', records);
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


}));

export default useEducationStore;
