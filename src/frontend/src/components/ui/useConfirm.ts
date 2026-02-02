import { useContext } from 'react';
import { ConfirmContext } from './ConfirmDialog';

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    // Tests may mock ConfirmDialog without providing a ConfirmProvider; return a safe stub
    return async () => false;
  }
  return context.confirm;
}
