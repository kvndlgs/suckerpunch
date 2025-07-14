import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, Trophy, User } from 'lucide-react';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-gray-900 border-b border-purple-500/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">
              <span className="text-purple-400">Sucker</span>
              <span className="text-orange-400">punch</span>
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-300">
              <User className="h-5 w-5" />
              <span>Welcome back!</span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}