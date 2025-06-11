import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-toastify';

const useDeathStore = create((set) => ({
  death: null,
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

  if (!formData.death_date) errors.death_date = 'Death date is required';
  
    if (!formData.death_place.trim()) errors.death_place = 'death_place is required';
    if (!formData.death_reason.trim()) errors.death_reason = 'death_reason is required';


    set({ formErrors: errors });
    return Object.keys(errors).length === 0;
  },

  addCustomer: async (personData = null) => {
    try {
      set({ loading: true });

      const dataToUse = personData || useDeathStore.getState().formData;
      
      // Make sure we have a profile ID (either prodile_id or profile_id)
      if (!dataToUse.prodile_id && !dataToUse.profile_id) {
        const errorMessage = 'Profile ID is required';
        toast.error(errorMessage);
        set({ error: errorMessage, loading: false });
        return false;
      }
      
      console.log("Adding death record with data:", dataToUse);

      const response = await axios.post('/api/Death', dataToUse);
      if (response.data?.success) {
        toast.success('Death record added successfully!');

        // Fetch updated record for this specific profile
        const profileId = dataToUse.prodile_id || dataToUse.profile_id;
        const updatedResponse = await axios.get(`/api/Death?id=${profileId}`);
        
        if (updatedResponse.data?.deaths) {
          set({
            deaths: updatedResponse.data.deaths, // Store as a single object
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
        const errorMessage = response.data?.message || 'Failed to add death record';
        toast.error(errorMessage);
        set({ error: errorMessage, loading: false });
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add death record';
      toast.error(errorMessage);
      console.error('Error adding death record:', error);
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  updateCustomer: async (personId, updatedData) => {
    try {
      set({ loading: true, error: null });
      
      console.log("Updating death record:", personId, updatedData);

      // Make sure we have a profile ID (either prodile_id or profile_id)
      if (!updatedData.prodile_id && !updatedData.profile_id) {
        const errorMessage = 'Profile ID is required for update';
        toast.error(errorMessage);
        set({ loading: false, error: errorMessage });
        return false;
      }

      const response = await axios.put('/api/Death', {
        _id: personId,
        ...updatedData,
      });

      if (response.data?.success) {
        toast.success('Death record updated successfully!');
        
        // Fetch updated record for this specific profile
        const profileId = updatedData.prodile_id || updatedData.profile_id;
        const updatedResponse = await axios.get(`/api/Death?id=${profileId}`);
        
        if (updatedResponse.data?.deaths) {
          set({
            deaths: updatedResponse.data.deaths, // Store as a single object
            loading: false,
            formData: {
              death_date: '',
              death_reason: '',
              death_place: '',
              profile_id: '',
            },
          });
        } else {
          // If fetch fails, update locally with the response data
          set({
            deaths: response.data.profile || null,
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
        const errorMessage = response.data?.message || 'Failed to update death record';
        toast.error(errorMessage);
        set({ loading: false, error: errorMessage });
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update death record';
      toast.error(errorMessage);
      console.error('Death record update error:', error);
      set({ loading: false, error: errorMessage });
      return false;
    }
  },

  deleteCustomer: async (personId) => {
    try {
      set({ loading: true });
      
      console.log("Deleting death record with ID:", personId);
      
      // Get the current state to find the profile ID before deletion
      const { deaths } = useDeathStore.getState();
      // Since deaths is a single object, not an array
      const profileId = deaths?._id === personId ? (deaths.prodile_id || deaths.profile_id) : null;
      
      console.log("Found profile ID for deletion:", profileId);

      const response = await axios.delete(`/api/Death?_id=${personId}`);

      if (response.data?.success) {
        toast.success('Death record deleted successfully!');
        
        // Set deaths to null since we've deleted the record
        set({
          deaths: null,
          loading: false,
        });
        
        // If we have the profile ID, check if there's a new death record for this profile
        if (profileId) {
          console.log(`Checking for new death record for profile ID: ${profileId}`);
          const updatedResponse = await axios.get(`/api/Death?id=${profileId}`);
          
          if (updatedResponse.data?.success && updatedResponse.data?.deaths) {
            set({
              deaths: updatedResponse.data.deaths, // Store as a single object
              loading: false,
            });
          }
        }
        
        return true;
      } else {
        const errorMessage = response.data?.message || 'Failed to delete death record';
        toast.error(errorMessage);
        set({ loading: false, error: errorMessage });
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete death record';
      toast.error(errorMessage);
      console.error("Error deleting death record:", error);
      set({ loading: false, error: errorMessage });
      return false;
    }
  },

 fetchCustomers: async (profileId = null) => {
  try {
    set({ loading: true });

    let url = '/api/Death';
    if (profileId) {
      url += `?id=${profileId}`;
      console.log(`🔍 Fetching death record for profile ID: ${profileId}`);
    }

    const response = await axios.get(url);
    const { success, message, death, deaths } = response.data;

    if (success) {
      if (profileId) {
        // Handle single death record response
        if (death) {
          console.log("✅ Death record fetched:", death);
          set({
            death: death, // Store as object instead of array
            loading: false,
            error: null,
          });
          return death;
        } else {
          console.log("ℹ️ No death record found for profile ID");
          set({
            death: null,
            loading: false,
            error: null,
          });
          return null;
        }
      } else {
        // Handle all death records
        console.log(`📦 All death records fetched: ${deaths.length}`);
        set({
          deaths: deaths || [],
          loading: false,
          error: null,
        });
        return deaths;
      }
    } else {
      const errMsg = message || 'No death record found';
      console.warn("⚠️ API responded with error:", errMsg);
      set({
        deaths: [],
        loading: false,
        error: errMsg,
      });
      return null;
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || '❌ Failed to fetch death data';
    console.error("🚨 Error fetching death record:", error);
    toast.error(errorMessage);
    set({ deaths: [], loading: false, error: errorMessage });
    return null;
  }
}


}));

export default useDeathStore;
