import React from 'react';
import { useDispatch } from 'react-redux';
import { Menu, LogOut } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch(logout());
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 h-16">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-600 hover:text-gray-900"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <LogOut size={20} className="mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;