import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import type { Vacante } from '@shared/schema';

export const useVacantes = () => {
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'vacantes'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Vacante[] = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as Vacante);
        });
        setVacantes(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching vacantes:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { vacantes, loading, error };
};
