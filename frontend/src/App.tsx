import { useState } from 'react';
import { loginWithGoogle } from './firebase';
import axios from 'axios';

function App() {
  const [jwt, setJwt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);

  const handleLogin = async () => {
    setError(null);
    const idToken = await loginWithGoogle();

    if (!idToken) {
      setError('Erro no login com Google (idToken nulo)');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/auth/login/firebase', {
        idToken,
      });

      setJwt(response.data.access_token);
      console.log('✅ JWT:', response.data.access_token);
    } catch (err: any) {
      console.error('❌ Erro ao autenticar no backend:', err);
      setError('Erro ao autenticar no backend');
    }
  };

  const getUserProfile = async () => {
    if (!jwt) return;

    try {
      const res = await axios.get('http://localhost:3000/users/me', {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      setMe(res.data);
    } catch (err: any) {
      console.error('❌ Erro ao buscar usuário:', err);
      setError('Erro ao buscar perfil');
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Login com Google + JWT</h1>

      {!jwt && <button onClick={handleLogin}>Entrar com Google</button>}

      {jwt && (
        <>
          <p>✅ Login OK</p>
          <code style={{ display: 'block', margin: '10px 0' }}>{jwt}</code>
          <button onClick={getUserProfile}>Buscar /users/me</button>
        </>
      )}

      {me && (
        <div style={{ marginTop: 20 }}>
          <h2>🧑 Perfil</h2>
          <pre>{JSON.stringify(me, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div style={{ color: 'red', marginTop: 20 }}>
          <strong>Erro:</strong> {error}
        </div>
      )}
    </div>
  );
}

export default App;
