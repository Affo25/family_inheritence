// store/useLoginStore.ts
import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-toastify';
import { redirect } from 'next/navigation';

const signupstore = create((set, get) => ({
  loading: false,
  error: null,
  formData: {
    first_name: '',
    last_name: '',
    email: '',
    contact: '',
    password: '',
    user_type: '', // 'User' or 'Admin'
  },
  formErrors: {},
  isAuthenticated: false,

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
      formErrors: { ...state.formErrors, [Object.keys(data)[0]]: '' },
    })),

 
    validateForm: (isSignup = false) => {
        const { formData } = get();
        const errors = {};
    
        if (!formData.email.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = 'Invalid email format';
        }
    
        if (!formData.password) {
          errors.password = 'Password is required';
        }
    
        if (isSignup) {
          if (!formData.first_name) {
            errors.first_name = 'First name is required';
          }
          if (!formData.last_name) {
            errors.last_name = 'Last name is required';
          }
          if (!formData.contact || !/^\d{10,12}$/.test(formData.contact)) {
            errors.contact = 'Valid contact number (10-12 digits) is required';
          }
          if (!formData.user_type) {
            errors.user_type = 'Select user type';
          }
        }
    
        set({ formErrors: errors });
        return Object.keys(errors).length === 0;
      },

  signup: async (loginData = null) => {
    set({ loading: true, error: null });

    const dataToUse = loginData || get().formData;

    if (!get().validateForm()) {
      set({ loading: false });
      return { success: false, message: 'Validation failed' };
    }

    console.log("passed data to api", dataToUse);

    try {
      const res = await axios.post('/api/Register', dataToUse, {withCredentials:true});

      if (res.data && res.data.success) {
        toast.success('User Created successful!');

        set({
          formData: {   
            first_name: '',
            last_name: '',
            email: '',
            contact: '',
            password: '',
            user_type: '',
             },
          loading: false,
          error: null,
          isAuthenticated: true,
        });
        
        return { success: true, user };
      } else {
        throw new Error(res.data?.message || 'User Created failed');
      }
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'User Created failed';
      set({ error: message, loading: false });
      toast.error(message);
      return { success: false, error: message };
    }
  },

}));

export default signupstore;
