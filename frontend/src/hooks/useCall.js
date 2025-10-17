import { useContext } from 'react';
import { CallContext } from '../context/CallContext.jsx';

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within CallProvider');
  }
  return context;
}