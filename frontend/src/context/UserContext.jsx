import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";

const UserContext = createContext(null);

export const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";

/**
 * Parses user object from localStorage safely
 */
function getInitialUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return { name: "Traveler", email: "", role: "user", avatar: "", profileImage: "" };
    const parsed = JSON.parse(raw);
    const avatar = parsed.avatar || parsed.profileImage || "";
    return {
      ...parsed,
      avatar,
      profileImage: avatar
    };
  } catch (err) {
    console.warn("Failed to parse initial user from localStorage:", err);
    return { name: "Traveler", email: "", role: "user", avatar: "", profileImage: "" };
  }
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);

  // Synchronize user state with localStorage and notify other components
  const updateUser = useCallback((newUserData) => {
    setUser((prev) => {
      const merged = typeof newUserData === "function" ? newUserData(prev) : { ...prev, ...newUserData };
      const normalizedAvatar = merged.avatar !== undefined ? merged.avatar : (merged.profileImage !== undefined ? merged.profileImage : (prev.avatar || prev.profileImage || ""));
      const finalized = {
        ...merged,
        avatar: normalizedAvatar,
        profileImage: normalizedAvatar
      };
      
      try {
        localStorage.setItem("user", JSON.stringify(finalized));
      } catch (e) {
        console.error("Failed to save user to localStorage:", e);
      }

      // Dispatch custom window event so any listeners update synchronously
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("travelai-user-updated", { detail: finalized }));
      }

      return finalized;
    });
  }, []);

  // Update profile image across entire portal
  const updateProfileImage = useCallback((imageUrl) => {
    updateUser({ avatar: imageUrl, profileImage: imageUrl });
  }, [updateUser]);

  // Remove profile image and reset to default
  const removeProfileImage = useCallback(() => {
    updateUser({ avatar: "", profileImage: "" });
  }, [updateUser]);

  // Refresh user data from backend API
  const refreshUser = useCallback(async (explicitEmail) => {
    const emailToFetch = explicitEmail || user?.email;
    if (!emailToFetch) return;

    try {
      const res = await axios.get(`${API_BASE}/api/user/profile-full/${emailToFetch}`);
      if (res.data) {
        const u = res.data;
        const avatar = u.avatar || u.profileImage || "";
        updateUser({
          ...u,
          avatar,
          profileImage: avatar
        });
      }
    } catch (err) {
      // Try fallback profile endpoint
      try {
        const res2 = await axios.get(`${API_BASE}/api/user/profile/${emailToFetch}`);
        if (res2.data) {
          const u2 = res2.data;
          const avatar2 = u2.avatar || u2.profileImage || "";
          updateUser({
            ...u2,
            avatar: avatar2,
            profileImage: avatar2
          });
        }
      } catch (e2) {
        // Silent catch if offline or error
      }
    }
  }, [user?.email, updateUser]);

  // Fetch full user profile on initial mount or when email changes
  useEffect(() => {
    if (user?.email) {
      refreshUser(user.email);
    }
  }, [user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen to storage events and custom user update events across tabs/components
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        try {
          const fresh = e.newValue ? JSON.parse(e.newValue) : null;
          if (fresh) {
            const avatar = fresh.avatar || fresh.profileImage || "";
            setUser({ ...fresh, avatar, profileImage: avatar });
          }
        } catch (err) {
          console.error("Storage event parse error:", err);
        }
      }
    };

    const handleCustomUserUpdate = (e) => {
      if (e.detail) {
        const detail = e.detail;
        const avatar = detail.avatar !== undefined ? detail.avatar : (detail.profileImage || "");
        setUser((prev) => ({ ...prev, ...detail, avatar, profileImage: avatar }));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("travelai-user-updated", handleCustomUserUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("travelai-user-updated", handleCustomUserUpdate);
    };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    const emptyUser = { name: "Traveler", email: "", role: "user", avatar: "", profileImage: "" };
    setUser(emptyUser);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("travelai-user-updated", { detail: emptyUser }));
    }
  }, []);

  const profileImage = user?.profileImage || user?.avatar || "";

  return (
    <UserContext.Provider
      value={{
        user,
        profileImage,
        updateUser,
        updateProfileImage,
        removeProfileImage,
        refreshUser,
        logout
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    // Fallback if rendered outside UserProvider to prevent crash
    const local = getInitialUser();
    return {
      user: local,
      profileImage: local.avatar || local.profileImage || "",
      updateUser: () => {},
      updateProfileImage: () => {},
      removeProfileImage: () => {},
      refreshUser: () => {},
      logout: () => {}
    };
  }
  return context;
}

export default UserContext;
