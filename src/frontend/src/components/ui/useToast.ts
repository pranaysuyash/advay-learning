import { useContext } from 'react';
import { ToastContext } from './Toast';

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Tests often mock the Toast module without providing a provider; return a safe no-op implementation
    return {
      showToast: () => {},
      hideToast: () => {},
    } as any;
  }
  return context;
}
