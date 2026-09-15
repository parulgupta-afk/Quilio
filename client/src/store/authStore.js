import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Register
      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', {
            name,
            email,
            password,
          });

          set({
            user: {
              _id: data._id,
              name: data.name,
              email: data.email,
              avatarUrl: data.avatarUrl,
              bio: data.bio,
            },
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          const message =
            error.response?.data?.message || 'Registration failed';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      // Login
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { email, password });

          set({
            user: {
              _id: data._id,
              name: data.name,
              email: data.email,
              avatarUrl: data.avatarUrl,
              bio: data.bio,
            },
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      // Logout
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // Get current user (refresh)
      fetchMe: async () => {
        const token = get().token;
        if (!token) return;

        try {
          const { data } = await api.get('/auth/me');
          set({
            user: data,
            isAuthenticated: true,
          });
        } catch (error) {
          // Token invalid → logout
          get().logout();
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'quilio-auth', // localStorage key
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
