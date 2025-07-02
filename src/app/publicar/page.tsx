'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';

export default function PublicarPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [zona, setZona] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');

  onAuthStateChanged(auth, (u) => {
    if (u) setUser(u);
    else router.push('/login');
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zona || !precio) return alert('Zona y precio son obligatorios');
    try {
      await addDoc(collection(db, 'pisos'), {
        owner: user.uid,
        zona,
        precio: Number(precio),
        descripcion,
        createdAt: Date.now(),
      });
      alert('Piso publicado con éxito');
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Error al publicar piso');
    }
  };

  if (!user) return <div className="p-8">Cargando...</div>;

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Publicar Piso Disponible</h1>
      <form onSubmit={handleSubmit} className="border p-4 rounded space-y-4">
        <input type="text" placeholder="Zona" value={zona} onChange={e => setZona(e.target.value)} className="border p-2 w-full" />
        <input type="number" placeholder="Precio (€)" value={precio} onChange={e => setPrecio(e.target.value)} className="border p-2 w-full" />
        <textarea placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="border p-2 w-full" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Publicar</button>
      </form>
    </div>
  );
}
