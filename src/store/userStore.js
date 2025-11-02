import { create } from "zustand";

export const useUserStore = create((set) => {
  console.log("Initializing user store"); // Debug log
  return {
    user: null,
    profile: null,
    authReady: false,
    setUser: (user) => {
      console.log("Setting user:", user); // Debug log
      set({ user });
    },
    setProfile: (profile) => {
      console.log("Setting profile:", profile); // Debug log
      set({ profile });
    },
    setAuthReady: (ready) => {
      console.log("Auth ready:", ready);
      set({ authReady: !!ready });
    },
  };
});
