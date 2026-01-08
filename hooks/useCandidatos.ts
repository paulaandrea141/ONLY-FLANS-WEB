import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import type { Candidato } from '@shared/schema';

export const useCandidatos = (maxResults: number = 50) => {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'candidatos'), limit(maxResults));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Candidato[] = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as Candidato);
        });
        setCandidatos(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching candidatos:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [maxResults]);

  return { candidatos, loading, error };
};
