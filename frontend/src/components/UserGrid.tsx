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

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data } = await api.get<User[]>(endpoint);
        setUsers(data);
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
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
      console.error("Erro ao carregar perfil público:", err);
    }
  };

  const closeModal = () => setSelectedUser(null);

  if (loading) {
    return <p className="text-sm text-gray-500">Carregando usuários…</p>;
  }

  if (users.length === 0) {
    return <p className="text-sm text-gray-500">Nenhum usuário encontrado.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-4 pb-24">
        {users.map((user) => {
          const fullName = user.full_name || user.nickname;
          const trimmedName = fullName.trim().split(" ").slice(0, 3).join(" ");

          return (
            <div
              key={user.id}
              className={`relative rounded-xl overflow-hidden cursor-pointer ${
                user.is_iconic
                  ? "p-[3px] bg-[linear-gradient(90deg,_#A557F2,_#FF007F,_#A557F2)] bg-[length:300%_300%] animate-[gradient-border_6s_linear_infinite] shadow-xl"
                  : ""
              }`}
              onClick={() => handleClick(user.id)}
            >
              <div className="rounded-xl overflow-hidden bg-white">
                <div className="relative">
                  <img
                    src={user.profile_picture_url || "/avatar_placeholder.png"}
                    alt={trimmedName}
                    className="w-full h-40 object-cover"
                  />

                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/90 to-transparent z-10" />

                  <div className="absolute bottom-2 left-3 right-3 z-20 text-left">
                    <span className="text-xs font-semibold text-white block truncate">
                      {trimmedName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedUser && (
        <UserProfileModal
          isOpen={!!selectedUser}
          onClose={closeModal}
          user={selectedUser}
        />
      )}
    </>
  );
};
