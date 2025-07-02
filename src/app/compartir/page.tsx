'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '@/lib/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  doc, getDoc, addDoc, collection,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface PerfilUsuario {
  nombre: string;
  genero: string;
  email: string;
  zona?: string;
  fumador?: boolean;
  mascotas?: boolean;
}

export default function CompartirPisoPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);

  // Form fields
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [zona, setZona] = useState('');
  const [precio, setPrecio] = useState('');
  const [habitaciones, setHabitaciones] = useState('');
  const [banos, setBanos] = useState('');
  const [salon, setSalon] = useState(false);
  const [cocina, setCocina] = useState(false);
  const [lavadora, setLavadora] = useState(false);
  const [fumador, setFumador] = useState(false);
  const [mascotas, setMascotas] = useState(false);

  // Imagen
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return router.push('/login');
      setUser(u);

      const snap = await getDoc(doc(db, 'userProfiles', u.uid));
      if (snap.exists()) {
        const data = snap.data() as PerfilUsuario;
        setPerfil(data);
        setZona(data.zona || '');
        setFumador(data.fumador || false);
        setMascotas(data.mascotas || false);
      }
    });

    return () => unsub();
  }, [router]);

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagenPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePublicar = async () => {
    setError('');
    if (!titulo || !descripcion || !zona || !precio || !habitaciones || !banos) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    setLoading(true);
    try {
      let imagenURL = '';
      if (imagen && user) {
        const storageRef = ref(storage, `pisos/${user.uid}_${Date.now()}`);
        await uploadBytes(storageRef, imagen);
        imagenURL = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'pisosCompartidos'), {
        uid: user?.uid,
        titulo,
        descripcion,
        zona,
        precio: Number(precio),
        habitaciones: Number(habitaciones),
        banos: Number(banos),
        salon,
        cocina,
        lavadora,
        fumador,
        mascotas,
        imagenURL,
        creadoEn: Date.now(),
        nombreAnunciante: perfil?.nombre || '',
        genero: perfil?.genero || '',
        email: perfil?.email || '',
      });

      alert('✅ Piso publicado correctamente');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al publicar el piso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Compartir un Piso</h1>
      <p className="text-gray-600 text-center mb-6">Publica tu anuncio para encontrar compañeros de piso fácilmente.</p>

      <input type="text" placeholder="Título del anuncio *" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full border rounded p-2 mb-4" />

      <textarea placeholder="Descripción *" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="w-full border rounded p-2 mb-4" rows={4} />

      <select value={zona} onChange={(e) => setZona(e.target.value)} className="w-full border rounded p-2 mb-4">
        <option value="">Selecciona la zona *</option>
        <option value="Centro">Centro</option>
        <option value="Campus">Campus</option>
        <option value="Residencia">Residencia</option>
        <option value="Universidad">Universidad</option>
        <option value="Barrocás">Barrocás</option>
        <option value="A Ponte">A Ponte</option>
        <option value="O Couto">O Couto</option>
        <option value="San Francisco">San Francisco</option>
        <option value="Mariñamansa">Mariñamansa</option>
        <option value="Vinteún">Vinteún</option>
      </select>

      <input type="number" placeholder="Precio (€ por mes) *" value={precio} onChange={(e) => setPrecio(e.target.value)} className="w-full border rounded p-2 mb-4" />

      <input type="number" placeholder="Nº de habitaciones *" value={habitaciones} onChange={(e) => setHabitaciones(e.target.value)} className="w-full border rounded p-2 mb-4" min={1} />

      <input type="number" placeholder="Nº de baños *" value={banos} onChange={(e) => setBanos(e.target.value)} className="w-full border rounded p-2 mb-4" min={1} />

      {/* Características */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={salon} onChange={(e) => setSalon(e.target.checked)} /> Salón
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={cocina} onChange={(e) => setCocina(e.target.checked)} /> Cocina equipada
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={lavadora} onChange={(e) => setLavadora(e.target.checked)} /> Lavadora
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={fumador} onChange={(e) => setFumador(e.target.checked)} /> Fumadores
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={mascotas} onChange={(e) => setMascotas(e.target.checked)} /> Mascotas
        </label>
      </div>

      {/* Imagen */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">Foto del piso (opcional)</label>
        <input id="fileUpload" type="file" accept="image/*" onChange={handleImagenChange} className="hidden" />
        <label htmlFor="fileUpload" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer inline-block">
          📸 Seleccionar imagen
        </label>
        {imagenPreview && (
          <img
            src={imagenPreview}
            alt="Vista previa del piso"
            className="mt-2 rounded w-full h-48 object-cover"
          />
          // ⚠️ Puedes reemplazar <img> por next/image si prefieres:
          // <Image src={imagenPreview} alt="Vista previa del piso" layout="responsive" width={400} height={300} className="mt-2 rounded object-cover" />
        )}
      </div>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <button
        onClick={handlePublicar}
        disabled={loading}
        className={`w-full py-3 rounded text-white font-semibold ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
      >
        {loading ? 'Publicando...' : 'Publicar Piso'}
      </button>
    </div>
  );
}
