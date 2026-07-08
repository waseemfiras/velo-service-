import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Settings, LogOut, ShieldAlert, BarChart3 } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';

interface UserMenuProps {
  onOpenSettings?: () => void;
  onOpenReport?: () => void;
  onOpenAdmin?: () => void;
}

export function UserMenu({ onOpenSettings, onOpenReport, onOpenAdmin }: UserMenuProps) {
  const { user, isAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full overflow-hidden border border-white/20 hover:border-white/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 relative"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0, scale: isOpen ? 0.9 : 1 }}
          transition={{ duration: 0.3, type: "spring" }}
          className="w-full h-full"
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center text-white font-medium">
              {(user.displayName || user.email || 'U')[0].toUpperCase()}
            </div>
          )}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(8px)' }}
              transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
              className="absolute right-0 top-14 w-64 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-white/10">
                <p className="text-white font-medium truncate">{user.displayName || 'User'}</p>
                <p className="text-white/50 text-sm truncate">{user.email}</p>
              </div>
              <div className="p-2 flex flex-col gap-1">
                {onOpenSettings && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">Settings</span>
                  </button>
                )}
                {onOpenReport && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenReport();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-sm font-medium">Report Issue</span>
                  </button>
                )}
                
                {isAdmin && onOpenAdmin && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-xl transition-colors text-left"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm font-medium">Admin Dashboard</span>
                  </button>
                )}

                <div className="h-px bg-white/10 my-1 mx-2" />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400/70 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
