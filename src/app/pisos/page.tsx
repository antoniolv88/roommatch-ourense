'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

export default function PisosPublicadosPage() {
  const [pisos, setPisos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPisos = async () => {
      const snapshot = await getDocs(collection(db, 'pisosCompartidos'));
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPisos(lista);
      setLoading(false);
    };
    fetchPisos();
  }, []);

  if (loading) return <p className="text-center mt-10">Cargando pisos...</p>;
  if (!pisos.length) return <p className="text-center mt-10">No hay pisos publicados aún.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 grid gap-6 sm:grid-cols-2">
      {pisos.map((piso) => (
        <div key={piso.id} className="border rounded shadow p-4 bg-white">
          {piso.imagenURL ? (
            <img
              src={piso.imagenURL}
              alt={piso.titulo}
              className="w-full h-48 object-cover rounded mb-3"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded mb-3 flex items-center justify-center text-4xl">🏠</div>
          )}

          <h2 className="text-xl font-semibold mb-1">{piso.titulo}</h2>
          <p className="text-gray-600 mb-2">{piso.descripcion}</p>

          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Zona:</strong> {piso.zona}</p>
            <p><strong>Precio:</strong> {piso.precio} €/mes</p>
            <p><strong>Habitaciones:</strong> {piso.habitaciones} - <strong>Baños:</strong> {piso.banos}</p>
            <p><strong>Salón:</strong> {piso.salon ? 'Sí' : 'No'} | <strong>Cocina equipada:</strong> {piso.cocina ? 'Sí' : 'No'} | <strong>Lavadora:</strong> {piso.lavadora ? 'Sí' : 'No'}</p>
            <p><strong>Fumadores:</strong> {piso.fumador ? 'Sí' : 'No'} | <strong>Mascotas:</strong> {piso.mascotas ? 'Sí' : 'No'}</p>
            <p className="text-sm text-gray-500 italic">Publicado por: {piso.nombreAnunciante || 'Anónimo'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
