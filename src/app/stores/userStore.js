// store/userStore.js
import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-toastify';

const userStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,
  modalOpen: false,
  currentUser: null,
  formData: {
    _id: '',
    first_name: '',
    last_name: '',
    email: '',
    contact: '',
    password: '',
    status: 'Active',
    user_type: 'User',
  },
  formErrors: {},
  
  // Reset form data
  resetForm: () => set({
    formData: {
      _id: '',
      first_name: '',
      last_name: '',
      email: '',
      contact: '',
      password: '',
      status: 'Active',
      user_type: 'User',
    },
    formErrors: {},
    currentUser: null
  }),
  
  // Set form data
  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data },
    formErrors: { ...state.formErrors, [Object.keys(data)[0]]: '' },
  })),
  
  // Toggle modal
  toggleModal: (user = null) => {
    const { resetForm } = get();
    
    if (user) {
      // Edit mode - populate form with user data
      set({
        modalOpen: true,
        currentUser: user,
        formData: {
          ...user,
          password: '', // Don't show password in edit mode
        }
      });
    } else {
      // Add mode - reset form
      resetForm();
      set({ modalOpen: true });
    }
  },
  
  closeModal: () => set({ modalOpen: false }),
  
  // Validate form
  validateForm: (isCreate = false) => {
    const { formData } = get();
    const errors = {};
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!formData.contact.trim()) {
      errors.contact = 'Contact is required';
    } else if (!/^\d{10,12}$/.test(formData.contact)) {
      errors.contact = 'Contact must be 10-12 digits';
    }
    
    if (isCreate && !formData.password) {
      errors.password = 'Password is required';
    }
    
    if (!formData.user_type) {
      errors.user_type = 'User type is required';
    }
    
    if (!formData.status) {
      errors.status = 'Status is required';
    }
    
    set({ formErrors: errors });
    return Object.keys(errors).length === 0;
  },
  
  // Fetch all users
  fetchUsers: async (filters = {}) => {
    set({ loading: true, error: null });
    
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await axios.get(`/api/Users?${queryParams.toString()}`);
      
      if (response.data && response.data.success) {
        set({
          users: response.data.data,
          loading: false
        });
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data?.message || 'Failed to fetch users');
      }
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Failed to fetch users';
      set({ error: message, loading: false });
      toast.error(message);
      return { success: false, error: message };
    }
  },
  
  // Create new user
  createUser: async () => {
    set({ loading: true, error: null });
    
    if (!get().validateForm(true)) {
      set({ loading: false });
      return { success: false, message: 'Validation failed' };
    }
    
    try {
      const response = await axios.post('/api/Register', get().formData);
      
      if (response.data && response.data.success) {
        toast.success('User created successfully!');
        get().fetchUsers(); // Refresh user list
        get().closeModal();
        get().resetForm();
        
        return { success: true };
      } else {
        throw new Error(response.data?.message || 'Failed to create user');
      }
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Failed to create user';
      set({ error: message, loading: false });
      toast.error(message);
      return { success: false, error: message };
    }
  },
  
  // Update existing user
  updateUser: async () => {
    set({ loading: true, error: null });
    
    if (!get().validateForm()) {
      set({ loading: false });
      return { success: false, message: 'Validation failed' };
    }
    
    try {
      const response = await axios.put('/api/Users', get().formData);
      
      if (response.data && response.data.success) {
        toast.success('User updated successfully!');
        get().fetchUsers(); // Refresh user list
        get().closeModal();
        get().resetForm();
        
        return { success: true, data: response.data.data };
      } else {
        throw new Error(response.data?.message || 'Failed to update user');
      }
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Failed to update user';
      set({ error: message, loading: false });
      toast.error(message);
      return { success: false, error: message };
    }
  },
  
  // Delete user
  deleteUser: async (userId) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.delete(`/api/Users?_id=${userId}`);
      
      if (response.data && response.data.success) {
        toast.success('User deleted successfully!');
        // get().fetchUsers(); // Refresh user list
        
        return { success: true };
      } else {
        throw new Error(response.data?.message || 'Failed to delete user');
      }
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Failed to delete user';
      set({ error: message, loading: false });
      toast.error(message);
      return { success: false, error: message };
    }
  },
  
  // Save user (create or update)
  saveUser: async () => {
    const { formData } = get();
    
    if (formData._id) {
      return get().updateUser();
    } else {
      return get().createUser();
    }
  }
}));

export default userStore;