'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebaseConfig';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  query,
  where,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function ExplorarPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [otrosUsuarios, setOtrosUsuarios] = useState<any[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchUsuarios = async (u: any) => {
      // Obtener likes y matches para filtrar ya vistos
      const likesSnapshot = await getDocs(query(collection(db, 'likes'), where('from', '==', u.uid)));
      const matchesSnapshot = await getDocs(query(collection(db, 'matches'), where('users', 'array-contains', u.uid)));

      const yaVistosIds = new Set<string>();
      likesSnapshot.forEach(doc => yaVistosIds.add(doc.data().to));
      matchesSnapshot.forEach(doc => {
        const otros = doc.data().users.filter((id: string) => id !== u.uid);
        otros.forEach((id: string) => yaVistosIds.add(id));
      });

      // Leer usuarios desde la colección correcta
      const snapshot = await getDocs(collection(db, 'userProfiles'));
      const disponibles = snapshot.docs
        .filter(doc => doc.id !== u.uid && !yaVistosIds.has(doc.id))
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((u: any) => u.nombre && u.zona); // filtro mínimo

      setOtrosUsuarios(disponibles);
    };

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        await fetchUsuarios(u);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLike = async () => {
    const likedUser = otrosUsuarios[index];
    if (!user || !likedUser) return;

    const from = user.uid;
    const to = likedUser.id;
    const likeId = `${from}_${to}`;
    const reverseLikeId = `${to}_${from}`;

    await setDoc(doc(db, 'likes', likeId), {
      from,
      to,
      timestamp: Date.now(),
    });

    const reverseSnap = await getDoc(doc(db, 'likes', reverseLikeId));
    if (reverseSnap.exists()) {
      const matchUsers = [from, to].sort();
      const matchId = `${matchUsers[0]}_${matchUsers[1]}`;

      await setDoc(doc(db, 'matches', matchId), {
        users: matchUsers,
        timestamp: Date.now(),
      });

      alert(`🎉 ¡Es un match con ${likedUser.nombre || 'otro usuario'}!`);
    } else {
      console.log('💖 Like enviado. Aún no hay match.');
    }

    nextUser();
  };

  const nextUser = () => {
    setIndex(prev => prev + 1);
  };

  if (!otrosUsuarios.length || index >= otrosUsuarios.length) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold mb-2">No hay más perfiles por mostrar 😅</h2>
        <p>¡Vuelve más tarde para ver nuevos Roomies!</p>
      </div>
    );
  }

  const current = otrosUsuarios[index];

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Explora Roomies</h2>

      <div className="border p-4 rounded shadow mb-4 bg-white text-center">
        {current.imagenURL ? (
          <img
            src={current.imagenURL}
            alt={current.nombre}
            className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto mb-4 flex items-center justify-center text-4xl">
            🧑
          </div>
        )}

        <p className="text-xl font-semibold">{current.nombre}</p>
        <p className="text-sm text-gray-600 mb-2">{current.email || 'Sin email'}</p>
        <p><strong>Zona:</strong> {current.zona}</p>
        <p><strong>Precio:</strong> {current.precio ? `${current.precio} €/mes` : 'No indicado'}</p>
        <p><strong>Fumador:</strong> {typeof current.fumador === 'boolean' ? (current.fumador ? 'Sí' : 'No') : 'No indicado'}</p>
        <p><strong>Mascotas:</strong> {typeof current.mascotas === 'boolean' ? (current.mascotas ? 'Sí' : 'No') : 'No indicado'}</p>
        <p><strong>Preferencias:</strong> {current.preferencias || 'Ninguna'}</p>
      </div>

      <div className="flex justify-around">
        <button onClick={nextUser} className="bg-gray-300 px-4 py-2 rounded">⏭️ Saltar</button>
        <button onClick={handleLike} className="bg-green-500 text-white px-4 py-2 rounded">❤️ Me gusta</button>
      </div>
    </div>
  );
}
