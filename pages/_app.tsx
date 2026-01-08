import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import '../globals.css';
import { LoadingBunker } from '../components/LoadingBunker';

export default function App({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Simular verificación de Firebase
    const timer = setTimeout(() => {
      // Verificar si las credenciales son placeholders
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      if (apiKey?.includes('placeholder')) {
        setHasError(true);
      }
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingBunker isError={hasError} />;
  }

  return <Component {...pageProps} />;
}
