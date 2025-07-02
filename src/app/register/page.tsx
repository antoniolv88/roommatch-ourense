'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebaseConfig';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [genero, setGenero] = useState('');
  const [zona, setZona] = useState('');
  const [mascotas, setMascotas] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const zonasOurense = [
    'Centro',
    'O Couto',
    'A Ponte',
    'Canedo',
    'Ventiuno',
    'Barbadas',
    'San Francisco',
    'O Pereiro de Aguiar',
    'O Carballiño',
    'Ribadavia',
    'Allariz',
    'Xinzo de Limia',
  ];

  const handleRegister = async () => {
    setError('');

    if (!email || !password || !nombre || !edad || !genero || !zona) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'userProfiles', user.uid), {
        nombre,
        edad: Number(edad),
        genero,
        zona,
        mascotas,
        email,
        createdAt: Date.now(),
      });

      setLoading(false);
      alert('Registro exitoso 🎉 ¡Ya puedes usar la app!');
      router.push('/dashboard');
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error desconocido al registrar.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Bienvenido a CompartirPisos</h1>
      <p className="mb-6 text-center text-gray-700">
        Crea tu cuenta para empezar a publicar pisos o buscar compañeros de piso fácilmente.
      </p>

      <input
        type="email"
        placeholder="Correo electrónico *"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border rounded p-2 mb-3"
        autoComplete="email"
      />
      <input
        type="password"
        placeholder="Contraseña * (mínimo 6 caracteres)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border rounded p-2 mb-3"
        autoComplete="new-password"
      />
      <input
        type="text"
        placeholder="Nombre *"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full border rounded p-2 mb-3"
      />
      <input
        type="number"
        placeholder="Edad *"
        value={edad}
        onChange={(e) => setEdad(e.target.value)}
        className="w-full border rounded p-2 mb-3"
        min={18}
      />

      <select
        value={genero}
        onChange={(e) => setGenero(e.target.value)}
        className="w-full border rounded p-2 mb-3"
        required
      >
        <option value="">Selecciona tu género *</option>
        <option value="masculino">Masculino</option>
        <option value="femenino">Femenino</option>
        <option value="otro">Otro</option>
        <option value="prefiero no decir">Prefiero no decir</option>
      </select>

      <select
        value={zona}
        onChange={(e) => setZona(e.target.value)}
        className="w-full border rounded p-2 mb-3"
        required
      >
        <option value="">Selecciona tu zona *</option>
        {zonasOurense.map((z) => (
          <option key={z} value={z}>{z}</option>
        ))}
      </select>

      <label className="mb-5 flex items-center gap-2 text-gray-700">
        <input
          type="checkbox"
          checked={mascotas}
          onChange={(e) => setMascotas(e.target.checked)}
          className="w-4 h-4"
        />
        ¿Tienes mascotas?
      </label>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <button
        onClick={handleRegister}
        disabled={loading}
        className={`w-full py-3 rounded text-white font-semibold ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>
    </div>
  );
}
