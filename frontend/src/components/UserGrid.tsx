import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface User {
  id: string;
  full_name: string;
  nickname: string;
  profile_picture_url: string | null;
}

interface UserGridProps {
  endpoint: string;
}

export const UserGrid: React.FC<UserGridProps> = ({ endpoint }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <p className="text-sm text-gray-500">Carregando usuários…</p>;
  }

  if (users.length === 0) {
    return <p className="text-sm text-gray-500">Nenhum usuário encontrado.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-3 pb-24">
      {users.map((u) => (
        <div key={u.id} className="relative h-32">
          <img
            src={u.profile_picture_url || "/avatar_placeholder.png"}
            alt={u.nickname}
            className="w-full h-32 object-cover rounded-xl"
          />
        </div>
      ))}
    </div>
  );
};