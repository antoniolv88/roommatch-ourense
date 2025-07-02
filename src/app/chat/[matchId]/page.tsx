'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebaseConfig';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  DocumentData
} from 'firebase/firestore';
import { User } from 'firebase/auth';

// Define el tipo del mensaje
interface ChatMessage {
  text: string;
  sender: string;
  timestamp: number;
}

export default function ChatPage() {
  const { matchId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      if (u) setUser(u);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!matchId) return;

    const q = query(
      collection(db, `chats/${matchId}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, snap => {
      const data = snap.docs.map(doc => doc.data() as ChatMessage);
      setMessages(data);
    });

    return unsubscribe;
  }, [matchId]);

  const sendMessage = async () => {
    if (!text || !user) return;

    await addDoc(collection(db, `chats/${matchId}/messages`), {
      text,
      sender: user.uid,
      timestamp: Date.now(),
    });

    setText('');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">💬 Chat</h2>
      <div className="border p-4 h-64 overflow-y-auto bg-gray-100 rounded">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.sender === user?.uid ? 'text-right' : 'text-left'}`}>
            <span className="inline-block bg-white px-3 py-1 rounded shadow">{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Escribe un mensaje"
        />
        <button onClick={sendMessage} className="bg-green-600 text-white px-4 rounded">
          Enviar
        </button>
      </div>
    </div>
  );
}
