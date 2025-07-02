'use client';
import { useEffect, useState } from 'react';
import { auth, db, storage } from '@/lib/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>({
    nombre: '',
    edad: '',
    genero: '',
    zona: '',
    mascotas: false,
    fumador: false,
    precio: '',
    preferencias: '',
    imagenURL: '',
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState('');
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

  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const docSnap = await getDoc(doc(db, 'userProfiles', u.uid));
        if (docSnap.exists()) {
          setPerfil(docSnap.data());
        }
      }
    });
  }, []);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setPerfil((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleGuardar = async () => {
    if (!user) return;
    setLoading(true);
    setMensaje('');

    try {
      let imagenURL = perfil.imagenURL;

      if (foto) {
        const storageRef = ref(storage, `fotos-perfil/${user.uid}`);
        await uploadBytes(storageRef, foto);
        imagenURL = await getDownloadURL(storageRef);
      }

      const datosAGuardar = {
        ...perfil,
        edad: Number(perfil.edad),
        precio: perfil.precio ? Number(perfil.precio) : null,
        imagenURL,
        updatedAt: Date.now(),
      };

      await setDoc(doc(db, 'userProfiles', user.uid), datosAGuardar);
      setMensaje('Perfil actualizado correctamente ✅');
    } catch (error) {
      setMensaje('Error al guardar el perfil ❌');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white mt-10 shadow rounded">
      <h1 className="text-2xl font-bold mb-6 text-center">Mi Perfil</h1>

      <input
        type="text"
        name="nombre"
        placeholder="Nombre"
        value={perfil.nombre}
        onChange={handleChange}
        className="w-full border rounded p-2 mb-3"
      />
      <input
        type="number"
        name="edad"
        placeholder="Edad"
        value={perfil.edad}
        onChange={handleChange}
        className="w-full border rounded p-2 mb-3"
        min={18}
      />

      <select
        name="genero"
        value={perfil.genero}
        onChange={handleChange}
        className="w-full border rounded p-2 mb-3"
      >
        <option value="">Selecciona tu género</option>
        <option value="masculino">Masculino</option>
        <option value="femenino">Femenino</option>
        <option value="otro">Otro</option>
        <option value="prefiero no decir">Prefiero no decir</option>
      </select>

      <select
        name="zona"
        value={perfil.zona}
        onChange={handleChange}
        className="w-full border rounded p-2 mb-3"
      >
        <option value="">Selecciona tu zona</option>
        {zonasOurense.map((z) => (
          <option key={z} value={z}>{z}</option>
        ))}
      </select>

      <label className="flex items-center gap-2 mb-3">
        <input
          type="checkbox"
          name="mascotas"
          checked={perfil.mascotas}
          onChange={handleChange}
        />
        Tengo mascotas
      </label>

      <label className="flex items-center gap-2 mb-3">
        <input
          type="checkbox"
          name="fumador"
          checked={perfil.fumador}
          onChange={handleChange}
        />
        Soy fumador/a
      </label>

      <input
        type="number"
        name="precio"
        placeholder="Precio máximo alquiler (€)"
        value={perfil.precio || ''}
        onChange={handleChange}
        className="w-full border rounded p-2 mb-3"
        min={0}
      />

      <textarea
        name="preferencias"
        placeholder="Preferencias, estilo de vida, etc."
        value={perfil.preferencias}
        onChange={handleChange}
        className="w-full border rounded p-2 mb-3"
        rows={3}
      />

      <div className="mb-4">
        <label
          htmlFor="fotoPerfil"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-4 py-2 rounded cursor-pointer inline-block"
        >
          📷 {foto ? 'Cambiar imagen' : 'Seleccionar imagen'}
        </label>
        <input
          id="fotoPerfil"
          type="file"
          onChange={(e) => setFoto(e.target.files?.[0] || null)}
          className="hidden"
          accept="image/*"
        />
        {foto && (
          <p className="text-sm text-gray-600 mt-1">Imagen seleccionada: {foto.name}</p>
        )}
      </div>


      {mensaje && <p className="text-center text-sm text-blue-600 mb-3">{mensaje}</p>}

      <button
        onClick={handleGuardar}
        disabled={loading}
        className={`w-full py-3 rounded text-white font-semibold ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  );
}
