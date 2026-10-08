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
        } finally {
          // Guarantee spinner is never stuck
          set((s) => (s.isLoading ? { isLoading: false } : {}));
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
          let message = 'Login failed';
          if (!error.response) {
            message =
              'Cannot reach API. Is the server running on port 5000? (Vite proxies /api → localhost:5000)';
          } else if (error.response.status === 401) {
            message =
              error.response.data?.message ||
              'Invalid email or password. Demo: aria@quilio.app / demo1234 (run npm run seed in server/)';
          } else if (error.response.status === 400) {
            message = error.response.data?.message || 'Invalid request';
          } else if (error.response.status === 503) {
            message =
              error.response.data?.message ||
              'Database unavailable. Check MONGODB_URI and that MongoDB is reachable.';
          } else if (error.response.status >= 500) {
            message =
              error.response.data?.message ||
              'Server error. Check server terminal logs and JWT_SECRET / MongoDB.';
          } else {
            message = error.response.data?.message || message;
          }
          set({ error: message, isLoading: false });
          return { success: false, message };
        } finally {
          set((s) => (s.isLoading ? { isLoading: false } : {}));
        }
      },

      

      // Google Login
      googleLogin: async (credentialOrPayload) => {
        set({ isLoading: true, error: null });
        try {
          const body =
            typeof credentialOrPayload === 'string'
              ? { credential: credentialOrPayload }
              : credentialOrPayload;

          const { data } = await api.post('/auth/google', body);

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

          return { success: true, user: data };
        } catch (error) {
          const message =
            error.response?.data?.message || 'Google authentication failed';
          set({ error: message, isLoading: false });
          return { success: false, message };
        } finally {
          // Guarantee spinner is never stuck
          set((s) => (s.isLoading ? { isLoading: false } : {}));
        }
      },

      // Logout
      logout: () => {
        try {
          localStorage.removeItem('quilio-auth');
        } catch (e) {}
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
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

      // Merge profile fields into current user (e.g. after avatar save)
      updateUser: (partial) => {
        const cur = get().user || {};
        set({
          user: {
            ...cur,
            ...partial,
          },
        });
      },
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
