import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export const Toast = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const colors = {
    success: 'bg-green-500/20 border-green-500 text-green-300',
    error: 'bg-red-500/20 border-red-500 text-red-300',
    info: 'bg-blue-500/20 border-blue-500 text-blue-300',
    warning: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  return (
    <div
      className={`fixed bottom-4 right-4 px-6 py-4 rounded-lg border backdrop-blur-xl ${colors[type]} animate-in fade-in slide-in-from-bottom-4 duration-300`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icons[type]}</span>
        <p>{message}</p>
      </div>
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: ToastType;
  }>>([]);

  const show = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, show, remove };
};
