import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null, token: string | null) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user, token) =>
        set(() => ({
          user,
          token,
        })),
      logout: () =>
        set(() => ({
          user: null,
          token: null,
        })),
    }),
    { name: "auth-storage" } 
  )
);

export default useAuthStore;
