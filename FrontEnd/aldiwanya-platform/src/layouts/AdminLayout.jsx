import  { useState } from 'react';
import { Sidebar } from '../components/admin/shared/Sidebar/Sidebar';
import { Navbar } from '../components/admin/shared/Nav/Navbar';

export const AdminLayout = ({ children, onSearch }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh min-h-0 bg-navy-950 overflow-hidden">
    
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <div className="min-h-0 min-w-0 flex-1 flex flex-col overflow-hidden">
        <Navbar 
          onSearch={onSearch} 
          isMobileOpen={isMobileOpen} 
          setIsMobileOpen={setIsMobileOpen} 
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 bg-surface-light text-white">
          {children}
        </main>
      </div>
    </div>
  );
};
