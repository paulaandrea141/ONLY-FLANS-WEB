import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import type { Lead } from '@shared/schema';

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'leads'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Lead[] = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as Lead);
        });
        setLeads(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching leads:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { leads, loading, error };
};
