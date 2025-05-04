import React from "react";
import { Link } from "react-router-dom";
import {
  Home as HomeIcon,
  Users as UsersIcon,
  User as UserIcon,
} from "lucide-react";

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full border-t border-gray-200 py-3 px-6 flex justify-around bg-gray-50 z-10">
      <Link to="/" aria-label="Home">
        <HomeIcon className="w-6 h-6 text-gray-500 hover:text-gray-900 transition" />
      </Link>
      <Link to="/users" aria-label="Usuários">
        <UsersIcon className="w-6 h-6 text-gray-500 hover:text-gray-900 transition" />
      </Link>
      <Link to="/profile" aria-label="Perfil">
        <UserIcon className="w-6 h-6 text-gray-500 hover:text-gray-900 transition" />
      </Link>
    </nav>
  );
}
