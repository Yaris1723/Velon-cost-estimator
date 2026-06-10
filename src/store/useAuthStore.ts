import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface RegisteredUser {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  registeredUsers: RegisteredUser[];
  
  // Actions
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (email: string, name: string) => void;
  createUserAccount: (user: Omit<RegisteredUser, 'role'>) => { success: boolean; message: string };
  deleteUserAccount: (email: string) => void;
}

const INITIAL_USERS: RegisteredUser[] = [
  {
    name: "Admin Velon",
    email: "admin@velon.com",
    password: "admin123",
    role: "admin"
  }
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      registeredUsers: INITIAL_USERS,

      login: (email, password) => {
        const found = get().registeredUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (found) {
          set({
            isAuthenticated: true,
            user: { name: found.name, email: found.email, role: found.role },
          });
          return true;
        }
        return false;
      },

      logout: () => set({
        isAuthenticated: false,
        user: null,
      }),

      updateProfile: (email, name) => set((state) => {
        if (!state.user) return {};
        const oldEmail = state.user.email;
        return {
          user: { ...state.user, email, name },
          registeredUsers: state.registeredUsers.map((u) =>
            u.email.toLowerCase() === oldEmail.toLowerCase()
              ? { ...u, email, name }
              : u
          )
        };
      }),

      createUserAccount: (newUser) => {
        const exists = get().registeredUsers.some(
          (u) => u.email.toLowerCase() === newUser.email.toLowerCase()
        );
        if (exists) {
          return { success: false, message: "User with this email already exists." };
        }
        const userWithRole: RegisteredUser = {
          ...newUser,
          role: 'user'
        };
        set((state) => ({
          registeredUsers: [...state.registeredUsers, userWithRole]
        }));
        return { success: true, message: "User account created successfully!" };
      },

      deleteUserAccount: (email) => set((state) => ({
        registeredUsers: state.registeredUsers.filter(
          (u) => u.email.toLowerCase() !== email.toLowerCase()
        )
      }))
    }),
    {
      name: 'velon-auth-storage',
    }
  )
);
