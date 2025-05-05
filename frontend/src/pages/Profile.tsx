import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { supabase } from "@/supabaseClient";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { UploadCloud, CheckCircle, Circle, X } from "lucide-react";

interface User {
  id: string;
  full_name: string;
  email: string;
  instagram: string | null;
  nickname: string;
  profile_picture_url: string | null;
  bio: string | null;
  show_public_profile: boolean;
  show_profile_to_iconics: boolean;
  date_of_birth: string | null;
  phone_number: string | null;
}

interface UserPhoto {
  id: string;
  url: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [phoneCode, setPhoneCode] = useState("55");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await api.get<User>("/users/me");
        if (data.date_of_birth) {
          data.date_of_birth = data.date_of_birth.split("T")[0];
        }
        if (data.phone_number) {
          const digits = data.phone_number.replace(/\D/g, "");
          const code =
            digits.length > 11 ? digits.slice(0, digits.length - 11) : "55";
          const number = digits.slice(-11);
          setPhoneCode(code);
          setPhoneNumber(number);
        }
        setUser(data);
        const photosRes = await api.get<UserPhoto[]>("/user-photos");
        setPhotos(photosRes.data);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!user) return;
    const { name, value, type, checked } = e.target;
    setUser({
      ...user,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateImage = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject();
      };
      img.src = url;
    });
  };

  const handleSave = async (): Promise<void> => {
    if (!user) return;
    try {
      const dto: any = {
        full_name: user.full_name,
        nickname: user.nickname,
        instagram: user.instagram || undefined,
        bio: user.bio || undefined,
        show_public_profile: user.show_public_profile,
        show_profile_to_iconics: user.show_profile_to_iconics,
      };
      if (user.date_of_birth) {
        dto.date_of_birth = new Date(user.date_of_birth).toISOString();
      }
      if (phoneNumber) {
        dto.phone_number = `+${phoneCode}${phoneNumber}`;
      }
      await api.patch(`/users/${user.id}`, dto);
      alert("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao salvar:", error.response?.data || error);
      alert(
        "Erro ao atualizar perfil. Verifique seus dados e tente novamente.\n" +
          (error.response?.data?.message || "")
      );
    }
  };

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isProfile = false
  ) => {
    if (!e.target.files || !user) return;
    const file = e.target.files[0];
    try {
      await validateImage(file);
    } catch {
      alert("Arquivo de imagem inválido ou corrompido.");
      return;
    }
    const ext = file.name.split(".")?.pop();
    const fileName = `${Date.now()}.${ext}`;
    const path = `${user.id}/${fileName}`;
    const { error } = await supabase.storage
      .from("user-photos")
      .upload(path, file);
    if (error) {
      alert("Falha no upload da imagem.");
      return;
    }
    const { data } = supabase.storage.from("user-photos").getPublicUrl(path);
    const url = data.publicUrl;
    if (isProfile) {
      await api.patch("/users/profile-picture", { url });
      setUser((u) => (u ? { ...u, profile_picture_url: url } : u));
    } else {
      await api.post("/user-photos", { url });
      const photosRes = await api.get<UserPhoto[]>("/user-photos");
      setPhotos(photosRes.data);
    }
  };

  const handlePhotoDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta foto?")) return;
    try {
      await api.delete(`/user-photos/${id}`);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Erro ao apagar foto:", err);
      alert("Falha ao excluir foto.");
    }
  };

  if (loading || !user) {
    return <p className="p-4">Carregando perfil...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 overflow-auto p-4 space-y-6 pb-24">
        <h1 className="text-2xl font-extrabold text-primary">Meu Perfil</h1>

        <div className="flex justify-center mb-4">
          <div className="relative w-24 h-32">
            <img
              src={user.profile_picture_url || "/avatar_placeholder.png"}
              alt="Avatar"
              className="w-24 h-32 rounded-xl object-cover"
            />
            <label className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow cursor-pointer">
              <UploadCloud className="w-5 h-5 text-black" />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handlePhotoUpload(e, true)}
              />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          {[
            {
              label: "Nome completo",
              name: "full_name",
              placeholder: "Digite seu nome completo",
              value: user.full_name,
            },
            {
              label: "Apelido",
              name: "nickname",
              placeholder: "Como prefere ser chamado?",
              value: user.nickname,
            },
            {
              label: "Instagram",
              name: "instagram",
              placeholder: "@seuuser",
              value: user.instagram || "",
            },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                name={field.name}
                placeholder={field.placeholder}
                value={field.value}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-white text-gray-900 outline-none"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Telefone
            </label>
            <div className="flex gap-2">
              <input
                value={phoneCode}
                onChange={(e) =>
                  setPhoneCode(e.target.value.replace(/\D/g, ""))
                }
                maxLength={4}
                className="w-16 p-3 rounded-xl bg-gray-100 text-gray-900 outline-none text-center"
              />
              <input
                placeholder="11999999999"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 11))
                }
                maxLength={11}
                inputMode="numeric"
                className="flex-1 p-3 rounded-xl bg-white text-gray-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              placeholder="Conte algo sobre você..."
              value={user.bio || ""}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-white text-gray-900 outline-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Data de nascimento
            </label>
            <input
              name="date_of_birth"
              type="date"
              value={user.date_of_birth || ""}
              onChange={handleChange}
              className="w-full p-3 rounded-xl bg-white text-gray-900 outline-none"
            />
          </div>

          <div className="space-y-2 mt-4">
            <button
              onClick={() =>
                setUser((u) =>
                  u ? { ...u, show_public_profile: !u.show_public_profile } : u
                )
              }
              className="flex items-center gap-2 text-sm font-medium text-gray-800"
            >
              {user.show_public_profile ? (
                <CheckCircle className="w-5 h-5 text-primary" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
              Exibir público
            </button>
            <button
              onClick={() =>
                setUser((u) =>
                  u
                    ? {
                        ...u,
                        show_profile_to_iconics: !u.show_profile_to_iconics,
                      }
                    : u
                )
              }
              className="flex items-center gap-2 text-sm font-medium text-gray-800"
            >
              {user.show_profile_to_iconics ? (
                <CheckCircle className="w-5 h-5 text-primary" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
              Mostrar na rede ICONIC
            </button>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold mt-4"
          >
            Salvar alterações
          </button>
        </div>

        <div className="mt-8">
          <h2 className="font-semibold mb-2 text-gray-800">
            Minhas Fotos ({photos.length}/6)
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <div key={p.id} className="relative h-32">
                <img
                  src={p.url}
                  className="w-full h-32 object-cover rounded-xl"
                />
                <button
                  onClick={() => handlePhotoDelete(p.id)}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {photos.length < 6 && (
              <label className="cursor-pointer flex items-center justify-center border-2 border-dashed rounded-xl h-32 bg-white text-gray-500">
                <span className="text-sm">+ Adicionar</span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handlePhotoUpload(e)}
                />
              </label>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}