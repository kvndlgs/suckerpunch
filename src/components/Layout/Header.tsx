import { useAuth } from '../../hooks/useAuth';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-gray-900 border-b border-purple-500/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-black text-white -mr-3">
              <span className="text-white">SUCKER</span>
            </h1>  
              <span><img src="/fist.png" alt="suckerpunch" className="w-14 mx-auto px-0" /></span>
              <h1 className="text-lg font-black text-white -ml-3">
              <span className="text-white">PUNCH</span>
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-300">
              <User className="h-5 w-5" />
              <span>Welcome back! {user?.user_metadata.username}</span>
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