import { useContext } from 'react';
import { StudentContext } from '@/context/StudentContext';

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
