// src/components/UserProfileModal.tsx
import React, { useMemo, useState } from "react";
import { Dialog } from "@headlessui/react";
import { X, Instagram } from "lucide-react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    full_name: string;
    nickname: string;
    profile_picture_url: string | null;
    is_iconic: boolean;
    bio?: string;
    instagram?: string;
    date_of_birth?: string;
    photos: { id: string; url: string }[];
  };
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
  });

  const allPhotos = useMemo(() => {
    const profile = user.profile_picture_url
      ? [{ id: "main", url: user.profile_picture_url }]
      : [];
    const filtered = user.photos.filter(
      (p) => p.url !== user.profile_picture_url
    );
    return [...profile, ...filtered];
  }, [user]);

  const calculateAge = (birthdate: string | undefined) => {
    if (!birthdate) return null;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(user.date_of_birth);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="relative w-full max-w-md mx-auto bg-white rounded-xl overflow-hidden shadow-xl">
        <button
          className="absolute top-2 right-2 z-50 p-1 bg-black/50 rounded-full text-white hover:bg-black"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Carousel */}
        <div className="relative">
          <div ref={sliderRef} className="keen-slider w-full h-[600px]">
            {allPhotos.map((photo, idx) => (
              <div
                key={photo.id}
                className="keen-slider__slide flex items-center justify-center bg-black"
              >
                <img
                  src={photo.url}
                  alt={`Foto ${idx + 1}`}
                  className="object-cover w-full h-full rounded-none"
                />
              </div>
            ))}
          </div>

          {/* Carousel dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {allPhotos.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  currentSlide === idx ? "bg-white/90" : "bg-white/30"
                }`}
              ></div>
            ))}
          </div>
        </div>

        <div className="p-4">
          {/* Nome, idade e selo */}
          <div className="flex items-center gap-2">
            <h2
              className={`text-lg font-bold ${
                user.is_iconic
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-border"
                  : "text-gray-800"
              }`}
            >
              {user.full_name}
              {age !== null ? `, ${age}` : ""}
            </h2>
            {user.is_iconic && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                ICONIC MEMBER
              </span>
            )}
          </div>

          {/* Bio */}
          {user.bio && <p className="text-sm mt-2 text-gray-600">{user.bio}</p>}

          {/* Instagram */}
          {user.instagram && (
            <a
              href={`https://instagram.com/${user.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 mt-2 text-sm text-gray-700"
            >
              <Instagram className="w-4 h-4" /> @{user.instagram}
            </a>
          )}
        </div>
      </div>
    </Dialog>
  );
};

/* Tailwind config:
@keyframes gradient-border {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animate-gradient-border {
  background-size: 200% 200%;
  animation: gradient-border 5s ease infinite;
}
*/