'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  onSnapshot,
  doc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Match {
  id: string;
  users: string[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});
  const [pisos, setPisos] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push('/login');
        return;
      }

      setUser(u);

      // Escuchar matches
      const matchesQuery = query(
        collection(db, 'matches'),
        where('users', 'array-contains', u.uid)
      );

      const unsubscribeMatches = onSnapshot(matchesQuery, async (snapshot) => {
        const matchesData: Match[] = snapshot.docs.map(doc => ({
          id: doc.id,
          users: doc.data().users,
        }));
        setMatches(matchesData);

        // Obtener otros usuarios de cada match
        const otherUserIds = matchesData
          .map(m => m.users.find(uid => uid !== u.uid))
          .filter(Boolean) as string[];

        const profilesMap: Record<string, any> = {};

        await Promise.all(
          otherUserIds.map(async (uid) => {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              profilesMap[uid] = docSnap.data();
            }
          })
        );

        setUserProfiles(profilesMap);

        // Cargar mensajes no leídos por match
        matchesData.forEach(async (match) => {
          const messagesQuery = query(
            collection(db, 'matches', match.id, 'messages'),
            where('to', '==', u.uid),
            where('read', '==', false)
          );
          const messagesSnapshot = await getDocs(messagesQuery);
          setUnreadCounts((prev) => ({
            ...prev,
            [match.id]: messagesSnapshot.size,
          }));
        });
      });

      // Cargar pisos publicados por el usuario
      const pisosQuery = query(
        collection(db, 'pisos'),
        where('owner', '==', u.uid)
      );
      const snapshot = await getDocs(pisosQuery);
      const pisosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPisos(pisosData);

      return () => {
        unsubscribeMatches();
      };
    });

    return () => unsubscribeAuth();
  }, []);

  if (!user) return <div className="p-8">Cargando...</div>;

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Panel de {user.email}</h1>

      {/* Botones */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <button
            onClick={() => router.push('/explorar')}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
            Ver usuarios compatibles
        </button>

        <button
          onClick={() => router.push('/compartir')}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Compartir piso
        </button>
        <button
          onClick={() => router.push('/publicar')}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Publicar piso
        </button>
      </div>

      {/* Pisos publicados */}
      <section className="mb-8">
        <h2 className="font-bold text-xl mb-2">Tus Pisos Publicados</h2>
        {pisos.length === 0 ? (
          <p>No tienes pisos publicados</p>
        ) : (
          <ul>
            {pisos.map(p => (
              <li key={p.id} className="border p-2 mb-2 rounded">
                <p><strong>Zona:</strong> {p.zona}</p>
                <p><strong>Precio:</strong> {p.precio} €</p>
                <p>{p.descripcion}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Matches */}
      <section>
        <h2 className="font-bold text-xl mb-4">Tus Matches y Chats</h2>
        {matches.length === 0 ? (
          <p>No tienes matches aún. ¡Explora y conecta!</p>
        ) : (
          <ul>
            {matches.map(match => {
              const otherUserId = match.users.find(uid => uid !== user.uid);
              const profile = userProfiles[otherUserId || ''];
              const unread = unreadCounts[match.id] || 0;

              return (
                <li
                  key={match.id}
                  className="mb-4 p-4 border rounded flex justify-between items-center"
                >
                  <div>
                    <p><strong>Match con:</strong> {profile?.nombre || 'Usuario desconocido'}</p>
                    {profile?.edad && (
                      <p className="text-sm text-gray-600">{profile.edad} años</p>
                    )}
                    {unread > 0 && (
                      <span className="text-red-600 font-bold">📩 {unread} sin leer</span>
                    )}
                  </div>
                  <Link href={`/chat/${match.id}`}>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded">Chat</button>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
