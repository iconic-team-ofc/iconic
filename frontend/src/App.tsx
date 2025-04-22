import { useEffect, useRef, useState } from "react";
import { loginWithGoogle } from "./firebase";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode";

function App() {
  const [jwt, setJwt] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [eventId, setEventId] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<any>(null);

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
    } catch (err) {
      setError("Erro ao carregar perfil");
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
      const res = await axios.post(
        "http://localhost:3000/event-checkins/scan",
        { qr_token: token },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      alert("✅ Check-in realizado com sucesso!");
      console.log(res.data);
    } catch (err: any) {
      alert("❌ Erro: " + (err.response?.data?.message || "Erro desconhecido"));
    }
  };

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
          scanner.clear().then(() => {
            setShowScanner(false);
          });
        },
        (error) => {
          console.warn("Erro ao escanear:", error);
        }
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
    <div style={{ padding: 40, fontFamily: "Arial" }}>
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
        <div style={{ marginTop: 20 }}>
          <h2>Olá, {me.full_name}</h2>
          <p>Função: {me.role}</p>
        </div>
      )}

      {me?.role === "user" && (
        <div style={{ marginTop: 20 }}>
          <input
            placeholder="ID do evento"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          />
          <button onClick={generateCheckin}>Gerar QR Code</button>

          {qrImage && (
            <div style={{ marginTop: 20 }}>
              <h3>Seu QR Code</h3>
              <img src={qrImage} alt="QR Code" />
            </div>
          )}
        </div>
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
        <p style={{ color: "red", marginTop: 20 }}>
          <strong>Erro:</strong> {error}
        </p>
      )}
    </div>
  );
}

export default App;
