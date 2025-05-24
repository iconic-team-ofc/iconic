// src/components/UserGrid.tsx
import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { UserProfileModal } from "./UserProfileModal";

export interface User {
  id: string;
  full_name: string;
  nickname: string;
  profile_picture_url: string | null;
  is_iconic: boolean;
}

interface UserGridProps {
  endpoint: string;
}

export const UserGrid: React.FC<UserGridProps> = ({ endpoint }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await api.get<User[]>(endpoint);
        // Shuffle users for random order
        const shuffled = data
          .map((u) => ({ value: u, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value);
        setUsers(shuffled);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [endpoint]);

  const handleClick = async (id: string) => {
    try {
      const { data } = await api.get(`/users/public/${id}`);
      setSelectedUser(data);
    } catch (err) {
      console.error("Error loading public profile:", err);
    }
  };

  const closeModal = () => setSelectedUser(null);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading users…</p>;
  }

  if (users.length === 0) {
    return <p className="text-sm text-gray-500">No users found.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4 pb-24">
        {users.map((user) => {
          const fullName = user.full_name || user.nickname;
          const trimmedName = fullName.trim().split(" ").slice(0, 3).join(" ");

          return (
            <div
              key={user.id}
              className="cursor-pointer"
              onClick={() => handleClick(user.id)}
            >
              <div
                className={
                  user.is_iconic
                    ? "rounded-xl p-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
                    : ""
                }
              >
                <div className="relative rounded-xl overflow-hidden bg-white shadow-lg">
                  <div className="w-full h-48 md:h-56 lg:h-64 bg-gray-200 relative">
                    {!loadedIds.has(user.id) && (
                      <div className="absolute inset-0 animate-pulse bg-gray-300"></div>
                    )}
                    <img
                      src={
                        user.profile_picture_url || "/avatar_placeholder.png"
                      }
                      alt={trimmedName}
                      loading="lazy"
                      onLoad={() =>
                        setLoadedIds((prev) => new Set(prev).add(user.id))
                      }
                      onError={(e) =>
                        (e.currentTarget.src = "/avatar_placeholder.png")
                      }
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                        loadedIds.has(user.id) ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-2 left-3 right-3 z-20 text-left">
                      <span
                        className={
                          user.is_iconic
                            ? "bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 font-bold text-xs"
                            : "text-white font-bold text-xs"
                        }
                      >
                        {trimmedName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedUser && (
        <UserProfileModal isOpen onClose={closeModal} user={selectedUser} />
      )}
    </>
  );
};
