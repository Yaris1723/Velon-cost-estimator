import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  name: string;
  email: string;
}

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      login: (email, name) => set({
        isAuthenticated: true,
        user: { name, email },
      }),

      logout: () => set({
        isAuthenticated: false,
        user: null,
      }),
    }),
    {
      name: 'velon-auth-storage',
    }
  )
);
