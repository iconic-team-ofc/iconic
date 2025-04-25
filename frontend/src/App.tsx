// src/App.tsx

import React, { useState, useEffect, useRef } from "react";
import { loginWithGoogle } from "./firebase";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode";
import { supabase } from "./supabaseClient";

const API_BASE = "http://localhost:3000";

const App: React.FC = () => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [userPhotos, setUserPhotos] = useState<any[]>([]);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);

  const [events, setEvents] = useState<any[]>([]);
  const [participations, setParticipations] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [confirmedUsers, setConfirmedUsers] = useState<any[]>([]);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [expandedUserData, setExpandedUserData] = useState<any | null>(null);

  const [bio, setBio] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");

  const [manualEmail, setManualEmail] = useState<string>("");
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const scannerRef = useRef<any>(null);

  // — AUTH —
  const handleLogin = async () => {
    try {
      const idToken = await loginWithGoogle();
      if (!idToken) throw new Error("Google login falhou");
      const res = await axios.post(`${API_BASE}/auth/login/firebase`, {
        idToken,
      });
      setJwt(res.data.access_token);
    } catch {
      setError("Falha na autenticação");
    }
  };

  // — LOAD PROFILE —
  const loadProfile = async () => {
    if (!jwt) return;
    try {
      const [meRes, photosRes, partsRes] = await Promise.all([
        axios.get(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${jwt}` },
        }),
        axios.get(`${API_BASE}/user-photos`, {
          headers: { Authorization: `Bearer ${jwt}` },
        }),
        axios.get(`${API_BASE}/event-participations`, {
          headers: { Authorization: `Bearer ${jwt}` },
        }),
      ]);
      setMe(meRes.data);
      setBio(meRes.data.bio || "");
      setNickname(meRes.data.nickname || "");
      setUserPhotos(photosRes.data);
      setParticipations(partsRes.data);
    } catch {
      setError("Erro ao carregar perfil");
    }
  };

  // — LOAD EVENTS —
  const loadEvents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/events/public`);
      setEvents(res.data);
    } catch {
      setError("Erro ao buscar eventos");
    }
  };

  // — LOAD CONFIRMED USERS —
  const loadConfirmedUsers = async (eventId: string) => {
    setSelectedEventId(eventId);
    try {
      const res = await axios.get(
        `${API_BASE}/event-participations/event/${eventId}/confirmed-users`,
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      setConfirmedUsers(res.data);
    } catch {
      setConfirmedUsers([]);
    }
  };

  // — UPDATE PROFILE —
  const updateProfile = async () => {
    if (!me) return;
    try {
      await axios.patch(
        `${API_BASE}/users/${me.id}`,
        { bio, nickname },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      await loadProfile();
      alert("Perfil salvo");
    } catch {
      setError("Erro ao salvar perfil");
    }
  };

  // — UPDATE PROFILE PICTURE —
  const updateProfilePicture = async () => {
    if (!profileImageFile || !me) return;
    try {
      const fileName = `profile-${Date.now()}.jpg`;
      const filePath = `${me.id}/${fileName}`;
      // upload no bucket 'user-photos'
      const { error: upErr } = await supabase.storage
        .from("user-photos")
        .upload(filePath, profileImageFile, { upsert: true });
      if (upErr) throw upErr;
      // obter URL pública
      const { data } = supabase.storage
        .from("user-photos")
        .getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      // chamar backend
      await axios.patch(
        `${API_BASE}/users/profile-picture`,
        { url: publicUrl },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      // atualizar local
      setMe({ ...me, profile_picture_url: publicUrl });
      alert("Foto de perfil atualizada");
    } catch {
      setError("Erro ao enviar foto de perfil");
    }
  };

  // — ADD USER PHOTO —
  const addUserPhoto = async () => {
    if (!newPhotoFile || !me) return;
    try {
      const fileName = `${Date.now()}.jpg`;
      const filePath = `${me.id}/${fileName}`;
      const { error: upErr } = await supabase.storage
        .from("user-photos")
        .upload(filePath, newPhotoFile);
      if (upErr) throw upErr;
      const { data } = supabase.storage
        .from("user-photos")
        .getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      await axios.post(
        `${API_BASE}/user-photos`,
        { url: publicUrl },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      await loadProfile();
      alert("Foto adicional enviada");
    } catch {
      setError("Erro ao enviar foto adicional");
    }
  };

  // — DELETE / MOVE USER PHOTO —
  const deleteUserPhoto = async (id: string) => {
    try {
      await axios.delete(`${API_BASE}/user-photos/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      await loadProfile();
    } catch {
      setError("Erro ao deletar foto");
    }
  };
  const movePhotoUp = async (photo: any, idx: number) => {
    if (idx === 0) return;
    try {
      const newPos = userPhotos[idx - 1].position;
      await axios.patch(
        `${API_BASE}/user-photos/${photo.id}`,
        { position: newPos },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      await loadProfile();
    } catch {
      setError("Erro ao reordenar foto");
    }
  };

  // — EVENTO: PARTICIPAR / CANCELAR —
  const participateEvent = async (evtId: string) => {
    try {
      await axios.post(
        `${API_BASE}/event-participations`,
        { event_id: evtId },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      await loadProfile();
      await loadConfirmedUsers(evtId);
    } catch {
      setError("Erro ao participar");
    }
  };
  const cancelParticipation = async (evtId: string) => {
    const part = participations.find((p) => p.event_id === evtId);
    if (!part) return;
    try {
      await axios.patch(
        `${API_BASE}/event-participations/${part.id}`,
        { status: "cancelled" },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      await loadProfile();
      setConfirmedUsers([]);
    } catch {
      setError("Erro ao cancelar");
    }
  };

  // — QR CHECKIN —
  const generateCheckin = async () => {
    if (!selectedEventId) return;
    try {
      const res = await axios.post(
        `${API_BASE}/event-checkins/generate`,
        { event_id: selectedEventId },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      setQrImage(res.data.qr_code_url);
    } catch {
      setError("Erro ao gerar QR");
    }
  };
  const scanCheckin = async (token: string) => {
    try {
      const res = await axios.post(
        `${API_BASE}/event-checkins/scan`,
        { qr_token: token },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      alert(`Check-in: ${res.data.full_name} (${res.data.nickname})`);
    } catch {
      setError("Erro no scan");
    }
  };

  // — MANUAL CHECKIN —
  const manualCheckin = async () => {
    if (!manualEmail || !selectedEventId) return;
    try {
      await axios.post(
        `${API_BASE}/event-checkins/manual-checkin`,
        { email: manualEmail, event_id: selectedEventId },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      alert("Check-in manual realizado");
    } catch {
      setError("Erro no check-in manual");
    }
  };

  // — TOGGLE EXPAND USER —
  const toggleExpandUser = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      setExpandedUserData(null);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/users/public/${userId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setExpandedUserId(userId);
      setExpandedUserData(res.data);
    } catch {
      setError("Perfil privado");
    }
  };

  // — EFFECTS —
  useEffect(() => {
    if (jwt) {
      loadProfile();
      loadEvents();
    }
  }, [jwt]);

  useEffect(() => {
    if (
      showScanner &&
      jwt &&
      (me?.role === "admin" || me?.role === "scanner")
    ) {
      if (scannerRef.current) scannerRef.current.clear().catch(() => {});
      const scanner = new Html5QrcodeScanner("scanner", {
        fps: 10,
        qrbox: 250,
      });
      scanner.render(
        (decoded) => {
          scanCheckin(decoded);
          scanner.clear().then(() => setShowScanner(false));
        },
        (err) => console.warn(err)
      );
      scannerRef.current = scanner;
    }
    return () => {
      if (scannerRef.current) scannerRef.current.clear().catch(() => {});
    };
  }, [showScanner, jwt, me]);

  // — RENDER —
  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center" }}>🎟️ Check-in App</h1>

      {!jwt ? (
        <button
          onClick={handleLogin}
          style={{
            display: "block",
            margin: "20px auto",
            padding: "10px 20px",
            background: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: 4,
          }}
        >
          Login com Google
        </button>
      ) : (
        <button
          onClick={loadProfile}
          style={{ float: "right", margin: 10, padding: "5px 10px" }}
        >
          Meu Perfil
        </button>
      )}

      {me && (
        <section
          style={{
            background: "#fafafa",
            padding: 20,
            borderRadius: 6,
            marginBottom: 30,
          }}
        >
          <h2>👤 Perfil</h2>
          <div style={{ display: "flex", gap: 20 }}>
            {/* Foto de perfil */}
            <div>
              <img
                src={me.profile_picture_url || "/placeholder.png"}
                alt="avatar"
                width={120}
                height={120}
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #ddd",
                }}
              />
              <div style={{ marginTop: 10 }}>
                <input
                  type="file"
                  onChange={(e) =>
                    setProfileImageFile(e.target.files?.[0] || null)
                  }
                />
                <button
                  onClick={updateProfilePicture}
                  style={{
                    marginLeft: 10,
                    padding: "5px 10px",
                    background: "#0070f3",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                  }}
                >
                  Atualizar
                </button>
              </div>
            </div>
            {/* Dados */}
            <div style={{ flex: 1 }}>
              <p>
                <strong>Nome:</strong> {me.full_name}
              </p>
              <p>
                <strong>Nickname:</strong>
              </p>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                style={{
                  width: "100%",
                  padding: 6,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  marginBottom: 10,
                }}
              />
              <p>
                <strong>Bio:</strong>
              </p>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  padding: 6,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
              />
              <button
                onClick={updateProfile}
                style={{
                  marginTop: 10,
                  padding: "8px 16px",
                  background: "#0070f3",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                }}
              >
                Salvar Perfil
              </button>
            </div>
          </div>

          {/* Fotos adicionais */}
          <div style={{ marginTop: 20 }}>
            <p>
              <strong>Fotos adicionais</strong>
            </p>
            <input
              type="file"
              onChange={(e) => setNewPhotoFile(e.target.files?.[0] || null)}
            />
            <button
              onClick={addUserPhoto}
              style={{
                marginLeft: 10,
                padding: "5px 10px",
                background: "#0070f3",
                color: "#fff",
                border: "none",
                borderRadius: 4,
              }}
            >
              Adicionar
            </button>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 10,
              }}
            >
              {userPhotos.map((p, i) => (
                <div key={p.id} style={{ position: "relative" }}>
                  <img
                    src={p.url}
                    alt="user-photo"
                    width={80}
                    height={80}
                    style={{ borderRadius: 4, objectFit: "cover" }}
                  />
                  <button
                    onClick={() => deleteUserPhoto(p.id)}
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      background: "rgba(255,0,0,0.7)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                    }}
                  >
                    ×
                  </button>
                  {i > 0 && (
                    <button
                      onClick={() => movePhotoUp(p, i)}
                      style={{
                        position: "absolute",
                        bottom: 2,
                        right: 2,
                        background: "rgba(0,0,0,0.5)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                      }}
                    >
                      ↑
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Eventos */}
      <section style={{ marginBottom: 30 }}>
        <h2>📅 Eventos</h2>
        {events.map((evt) => {
          const part = participations.find((p) => p.event_id === evt.id);
          return (
            <div
              key={evt.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
                borderBottom: "1px solid #eee",
              }}
            >
              <strong>{evt.title}</strong>
              {part?.status === "confirmed" ? (
                <>
                  <button
                    onClick={() => cancelParticipation(evt.id)}
                    style={{
                      marginRight: 8,
                      padding: "5px 10px",
                      background: "#ff4081",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => loadConfirmedUsers(evt.id)}
                    style={{
                      padding: "5px 10px",
                      background: "#2196f3",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                    }}
                  >
                    Confirmados
                  </button>
                </>
              ) : (
                <button
                  onClick={() => participateEvent(evt.id)}
                  style={{
                    padding: "5px 10px",
                    background: "#4caf50",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                  }}
                >
                  Participar
                </button>
              )}
            </div>
          );
        })}
      </section>

      {/* Confirmados & Check-in */}
      {selectedEventId && (
        <section style={{ marginBottom: 30 }}>
          <h3>
            Evento: <em>{selectedEventId}</em>
          </h3>
          <div style={{ marginBottom: 15 }}>
            <button
              onClick={generateCheckin}
              style={{
                marginRight: 8,
                padding: "5px 10px",
                background: "#607d8b",
                color: "#fff",
                border: "none",
                borderRadius: 4,
              }}
            >
              Gerar QR Code
            </button>
            {qrImage && <img src={qrImage} alt="QR" width={100} />}
          </div>
          <div>
            <h4>✅ Confirmados</h4>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {confirmedUsers.map((u) => (
                <div key={u.id} style={{ textAlign: "center", width: 100 }}>
                  <img
                    src={u.profile_picture_url || "/placeholder.png"}
                    alt="avatar"
                    width={60}
                    height={60}
                    style={{
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid #ddd",
                    }}
                  />
                  <div style={{ margin: "6px 0", fontSize: 13 }}>
                    {u.nickname || "Anônimo"}
                  </div>
                  <button
                    onClick={() => toggleExpandUser(u.id)}
                    style={{
                      fontSize: 12,
                      padding: "3px 6px",
                      border: "1px solid #ccc",
                      borderRadius: 4,
                    }}
                  >
                    {expandedUserId === u.id ? "Ocultar" : "Ver Perfil"}
                  </button>
                  {expandedUserId === u.id && expandedUserData && (
                    <div style={{ marginTop: 8 }}>
                      {expandedUserData.photos?.map((p: any) => (
                        <img
                          key={p.id}
                          src={p.url}
                          alt=""
                          width={40}
                          height={40}
                          style={{
                            margin: 2,
                            borderRadius: 4,
                            objectFit: "cover",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {(me.role === "admin" || me.role === "scanner") && (
            <div style={{ marginTop: 20 }}>
              <h4>👮 Check-in Manual / Scanner</h4>
              <input
                type="email"
                placeholder="Email para manual"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                style={{
                  padding: 6,
                  marginRight: 8,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
              />
              <button
                onClick={manualCheckin}
                style={{
                  marginRight: 8,
                  padding: "5px 10px",
                  background: "#ff9800",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                }}
              >
                Check-in Manual
              </button>
              <button
                onClick={() => setShowScanner(!showScanner)}
                style={{
                  padding: "5px 10px",
                  background: "#9c27b0",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                }}
              >
                {showScanner ? "Fechar Scanner" : "Escanear QR"}
              </button>
              {showScanner && (
                <div id="scanner" style={{ marginTop: 12, width: 300 }}></div>
              )}
            </div>
          )}
        </section>
      )}

      {error && (
        <p style={{ color: "#e53935", textAlign: "center" }}>{error}</p>
      )}
    </div>
  );
};

export default App;
