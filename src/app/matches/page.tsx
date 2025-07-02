'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, DocumentData } from 'firebase/firestore';
import Link from 'next/link';

type Match = {
  id: string;
  users: string[];
};

export default function MatchesPage() {
  const [user, setUser] = useState<any>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      setUser(u);

      const snapshot = await getDocs(collection(db, 'matches'));

      // Solución más robusta para prevenir errores en `doc.id`
      const allMatches: Match[] = snapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        users: doc.data().users || [],
      }));

      const myMatches = allMatches.filter((match) =>
        match.users.includes(u.uid)
      );

      setMatches(myMatches);
    });

    return () => unsubscribe();
  }, []);

  if (!user) return <div className="p-4">Cargando usuario...</div>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">💞 Tus Matches</h2>

      {matches.length === 0 && <p>Aún no tienes matches.</p>}

      {matches.map((match) => {
        const otherId = match.users.find((id) => id !== user.uid);

        return (
          <div key={match.id} className="border p-4 rounded mb-3 bg-white shadow">
            <p>Has hecho match con:</p>
            <strong>{otherId}</strong>
            <Link href={`/chat/${match.id}`}>
              <button className="mt-2 bg-blue-600 text-white px-4 py-1 rounded">
                💬 Abrir chat
              </button>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
