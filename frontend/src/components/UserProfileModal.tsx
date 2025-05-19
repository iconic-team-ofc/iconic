import React, { useMemo, useState, useEffect, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Pegando o tamanho da viewport (importante para slide fixo em mobile)
  const [vw, setVw] = useState(() => window.innerWidth);

  useEffect(() => {
    const handleResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Carrossel
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    mode: "free-snap",
    renderMode: "performance",
  });

  // Fotos (profile_picture_url sempre em primeiro)
  const allPhotos = useMemo(() => {
    const profile = user.profile_picture_url
      ? [{ id: "main", url: user.profile_picture_url }]
      : [];
    const filtered =
      user.photos?.filter((p) => p.url !== user.profile_picture_url) || [];
    return [...profile, ...filtered];
  }, [user]);

  // Idade
  const calculateAge = (birthdate?: string) => {
    if (!birthdate) return null;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };
  const age = calculateAge(user.date_of_birth);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70"
    >
      <div
        ref={containerRef}
        className="relative w-full h-full sm:max-w-md sm:h-auto bg-white rounded-none sm:rounded-2xl shadow-xl flex flex-col"
        style={{
          maxHeight: "100dvh",
          minHeight: "400px",
        }}
      >
        {/* Botão fechar */}
        <button
          className="absolute top-4 right-4 z-50 p-1 bg-black/70 rounded-full text-white hover:bg-black transition"
          onClick={onClose}
          aria-label="Fechar"
          style={{ lineHeight: 0 }}
        >
          <X className="w-7 h-7" />
        </button>

        {/* Carrossel (preenche 100vw largura e até 70% da altura tela/modal) */}
        <div
          className="relative w-full flex-shrink-0"
          style={{
            height: `min(70vh, 520px)`,
            minHeight: "260px",
            width: "100vw",
            maxWidth: "100vw",
            background: "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
          }}
        >
          <div
            ref={sliderRef}
            className="keen-slider"
            style={{
              width: "100vw",
              height: "100%",
              maxWidth: "100vw",
            }}
          >
            {allPhotos.length ? (
              allPhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="keen-slider__slide flex items-center justify-center"
                  style={{
                    width: `${vw}px`,
                    minWidth: `${vw}px`,
                    maxWidth: `${vw}px`,
                    height: "100%",
                    background: "#141414",
                  }}
                >
                  <img
                    src={photo.url}
                    alt={`Foto ${idx + 1}`}
                    className="object-cover w-full h-full"
                    style={{
                      maxWidth: "100vw",
                      width: "100vw",
                      minWidth: "100vw",
                      height: "100%",
                      userSelect: "none",
                      pointerEvents: "none",
                      borderRadius: 0,
                    }}
                    draggable={false}
                  />
                </div>
              ))
            ) : (
              <div className="keen-slider__slide flex items-center justify-center bg-gray-100 w-full h-full">
                <span className="text-gray-400 text-xs">Sem fotos</span>
              </div>
            )}
          </div>
          {/* Dots */}
          {allPhotos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {allPhotos.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    currentSlide === idx ? "bg-white/95" : "bg-white/30"
                  }`}
                ></div>
              ))}
            </div>
          )}
        </div>

        {/* Infos do usuário */}
        <div className="flex-1 p-4 pt-3 flex flex-col justify-start bg-white">
          <div className="flex items-center gap-2 mb-1 mt-0.5 min-w-0 flex-nowrap">
            <h2 className="text-base font-extrabold text-gray-900 truncate leading-5 uppercase flex-shrink min-w-0">
              {user.full_name}
              {age !== null ? `, ${age}` : ""}
            </h2>
            {user.is_iconic && (
              <span className="iconic-animated-badge">ICONIC MEMBER</span>
            )}
          </div>
          {/* Nick */}
          <span className="text-xs text-gray-400 mb-2 truncate block">
            @{user.nickname}
          </span>
          {/* Bio */}
          {user.bio && (
            <p className="text-[13px] leading-snug text-gray-700 mb-2">
              {user.bio}
            </p>
          )}
          {/* Instagram */}
          {user.instagram && (
            <a
              href={`https://instagram.com/${user.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 mt-1 text-xs text-gray-700 hover:text-gray-900 transition"
              style={{
                textDecoration: "none",
                fontWeight: 500,
                letterSpacing: ".01em",
              }}
            >
              <Instagram className="w-4 h-4 opacity-80" /> @{user.instagram}
            </a>
          )}
        </div>

        {/* Badge css */}
        <style>
          {`
          .iconic-animated-badge {
            background: linear-gradient(90deg, #a855f7, #ec4899, #fde68a, #a855f7);
            background-size: 400% 400%;
            color: white;
            animation: gradient-move 2.5s linear infinite;
            border: none;
            text-shadow: 0 1px 3px rgba(0,0,0,0.10);
            letter-spacing: 0.04em;
            font-size: 11px;
            padding: 2px 10px;
            min-width: 92px;
            max-width: 130px;
            white-space: nowrap;
            text-align: center;
            display: inline-block;
            box-shadow: 0 2px 8px 0 rgba(168,85,247,0.14);
            font-family: inherit;
            border-radius: 14px;
          }
          @media (max-width: 400px) {
            .iconic-animated-badge {
              font-size: 10px;
              padding: 1.5px 8px;
              min-width: 70px;
              max-width: 96px;
            }
          }
          @keyframes gradient-move {
            0% { background-position: 0% 50%;}
            50% { background-position: 100% 50%;}
            100% { background-position: 0% 50%;}
          }
        `}
        </style>
      </div>
    </Dialog>
  );
};
