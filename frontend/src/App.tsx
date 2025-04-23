import { useEffect, useRef, useState } from "react";
import { loginWithGoogle } from "./firebase";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode";
import { supabase } from "./supabaseClient";

function App() {
  const [jwt, setJwt] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [participations, setParticipations] = useState<any[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<any>(null);
  const [bio, setBio] = useState("");

  const handleLogin = async () => {
    const idToken = await loginWithGoogle();
    if (!idToken) return setError("Google login failed");

    try {
      const { data } = await axios.post(
        "http://localhost:3000/auth/login/firebase",
        { idToken }
      );
      setJwt(data.access_token);
    } catch (err) {
      setError("Auth failed");
    }
  };

  const getProfile = async () => {
    try {
      const res = await axios.get("http://localhost:3000/users/me", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setMe(res.data);
      setBio(res.data.bio || "");

      const photoRes = await axios.get("http://localhost:3000/user-photos", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setPhotos(photoRes.data);

      const partRes = await axios.get(
        "http://localhost:3000/event-participations",
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );
      setParticipations(partRes.data.map((p: any) => p.event_id));
    } catch (err) {
      setError("Erro ao carregar perfil");
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:3000/events/public");
      setEvents(res.data);
    } catch (err) {
      setError("Erro ao buscar eventos");
    }
  };

  const updateProfile = async () => {
    try {
      await axios.patch(
        `http://localhost:3000/users/${me.id}`,
        { bio },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      alert("Perfil atualizado");
    } catch (err) {
      setError("Erro ao atualizar perfil");
    }
  };

  const uploadImage = async () => {
    if (!imageFile || !me) return;
    const fileName = `${Date.now()}.jpeg`;
    const filePath = `${me.id}/${fileName}`;
  
    const { error: uploadError } = await supabase.storage
      .from("user-photos")
      .upload(filePath, imageFile);
  
    if (uploadError) {
      console.error(uploadError);
      return setError("Erro ao fazer upload da imagem");
    }
  
    const {
      data: { publicUrl },
    } = supabase.storage.from("user-photos").getPublicUrl(filePath);
  
    try {
      await axios.post(
        "http://localhost:3000/user-photos",
        { url: publicUrl },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      alert("Imagem enviada");
      getProfile();
    } catch {
      setError("Erro ao salvar imagem");
    }
  };
  

  const handleParticipate = async (eventId: string) => {
    try {
      await axios.post(
        "http://localhost:3000/event-participations",
        { event_id: eventId },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      getProfile();
    } catch {
      alert("Erro ao participar do evento");
    }
  };

  const handleCancel = async (eventId: string) => {
    try {
      const partRes = await axios.get(
        "http://localhost:3000/event-participations",
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );
      const part = partRes.data.find((p: any) => p.event_id === eventId);
      if (!part) return;
      await axios.patch(
        `http://localhost:3000/event-participations/${part.id}`,
        { status: "cancelled" },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      getProfile();
    } catch {
      alert("Erro ao cancelar participação");
    }
  };

  const generateCheckin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3000/event-checkins/generate",
        { event_id: eventId },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      setQrImage(res.data.qr_code_url);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao gerar QR code");
    }
  };

  const scanCheckin = async (token: string) => {
    try {
      await axios.post(
        "http://localhost:3000/event-checkins/scan",
        { qr_token: token },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      alert("✅ Check-in realizado com sucesso!");
    } catch (err: any) {
      alert("❌ Erro: " + (err.response?.data?.message || "Erro desconhecido"));
    }
  };

  useEffect(() => {
    if (jwt) {
      getProfile();
      fetchEvents();
    }
  }, [jwt]);

  useEffect(() => {
    const isAllowedToScan = me?.role === "admin" || me?.role === "scanner";

    if (showScanner && jwt && isAllowedToScan) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }

      const scanner = new Html5QrcodeScanner("scanner", {
        fps: 10,
        qrbox: 250,
      });

      scanner.render(
        (decodedText) => {
          scanCheckin(decodedText);
          scanner.clear().then(() => setShowScanner(false));
        },
        (error) => console.warn("Erro ao escanear:", error)
      );

      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [showScanner, jwt, me]);

  return (
    <div style={{ padding: 40 }}>
      <h1>Check-in App</h1>

      {!jwt && <button onClick={handleLogin}>Login com Google</button>}

      {jwt && (
        <>
          <button onClick={getProfile}>Ver Perfil</button>
          <p>
            <strong>JWT:</strong>
          </p>
          <code style={{ background: "#eee", padding: 10, display: "block" }}>
            {jwt}
          </code>
        </>
      )}

      {me && (
        <div>
          <h2>Olá, {me.full_name}</h2>
          <p>
            <strong>Função:</strong> {me.role}
          </p>
          <h3>🧾 JSON Completo</h3>
          <pre>{JSON.stringify(me, null, 2)}</pre>
          <h3>🖼️ Suas fotos</h3>
          <div style={{ display: "flex", gap: 10 }}>
            {photos.map((photo: any) => (
              <img
                key={photo.id}
                src={photo.url}
                alt="User Photo"
                width={100}
                height={100}
                style={{
                  objectFit: "cover",
                  borderRadius: "8px",
                  margin: "5px",
                }}
                onError={(e) => {
                  console.error("Erro ao carregar imagem:", photo.url);
                  (e.target as HTMLImageElement).src = "/fallback.png";
                }}
              />
            ))}
          </div>
          <input
            type="file"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          <button onClick={uploadImage}>Upload Foto</button>

          <h3>Editar Bio</h3>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
          />
          <br />
          <button onClick={updateProfile}>Salvar</button>
        </div>
      )}

      <h2>Eventos disponíveis</h2>
      {events.map((event) => (
        <div
          key={event.id}
          style={{ border: "1px solid #ccc", marginBottom: 10, padding: 10 }}
        >
          <strong>{event.title}</strong>
          <p>{event.description}</p>
          {participations.includes(event.id) ? (
            <>
              <button onClick={() => handleCancel(event.id)}>
                Cancelar participação
              </button>
              <button onClick={() => setEventId(event.id)}>
                Selecionar para gerar QR
              </button>
            </>
          ) : (
            <button onClick={() => handleParticipate(event.id)}>
              Participar
            </button>
          )}
        </div>
      ))}

      {eventId && (
        <>
          <h3>Evento selecionado: {eventId}</h3>
          <button onClick={generateCheckin}>Gerar QR Code</button>
          {qrImage && <img src={qrImage} alt="QR Code" />}
        </>
      )}

      {(me?.role === "admin" || me?.role === "scanner") && (
        <div style={{ marginTop: 30 }}>
          <button onClick={() => setShowScanner((prev) => !prev)}>
            {showScanner ? "Fechar Scanner" : "Escanear QR Code"}
          </button>
          {showScanner && (
            <div id="scanner" style={{ marginTop: 20, width: 300 }}></div>
          )}
        </div>
      )}

      {error && (
        <p style={{ color: "red" }}>
          <strong>Erro:</strong> {error}
        </p>
      )}
    </div>
  );
}

export default App;
