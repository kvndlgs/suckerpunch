import React from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/Auth/AuthForm';
import { Header } from './components/Layout/Header';
import { Dashboard } from './components/Dashboard/Dashboard';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header />
      <Dashboard />
    </div>
  );
}

export default App;