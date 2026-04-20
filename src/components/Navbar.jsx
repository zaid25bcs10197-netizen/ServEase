import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Hammer, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const NavLinks = ({ user, onLogout, onCloseMobile }) => (
  <>
    <Link
      to="/"
      onClick={onCloseMobile}
      className="nav-anim-link text-gray-600 hover:text-primary-600 font-medium transition-colors"
    >
      Discover
    </Link>
    {user ? (
      <>
        <Link
          to="/dashboard"
          onClick={onCloseMobile}
          className="nav-anim-link text-gray-600 hover:text-primary-600 font-medium transition-colors"
        >
          Dashboard
        </Link>
        <div className="hidden md:flex items-center gap-2 border-l border-gray-200 pl-4 ml-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={18} />
            <span className="font-medium">{user.name || user.email.split('@')[0]}</span>
          </div>
          <button
            onClick={onLogout}
            className="btn-anim p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
        <button
          onClick={onLogout}
          className="btn-anim md:hidden flex items-center justify-center gap-2 w-full mt-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium"
        >
          <LogOut size={18} /> Logout
        </button>
      </>
    ) : (
      <>
        <Link
          to="/login"
          onClick={onCloseMobile}
          className="nav-anim-link text-gray-600 hover:text-primary-600 font-medium transition-colors md:mr-2"
        >
          Log in
        </Link>
        <Link
          to="/signup"
          onClick={onCloseMobile}
          className="btn-anim bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-center mt-2 md:mt-0"
        >
          Sign up
        </Link>
      </>
    )}
  </>
);

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const handleCloseMobile = () => setIsMobileMenuOpen(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-tr from-primary-600 to-secondary-500 text-white p-2 md:p-2.5 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
              <Hammer size={22} className="stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-xl md:text-2xl tracking-tight text-gray-900 flex items-center">
              Serv<span className="text-secondary-500">Ease</span>
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <NavLinks user={user} onLogout={handleLogout} onCloseMobile={handleCloseMobile} />
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div className={`md:hidden absolute w-full bg-white border-b border-gray-100 shadow-xl overflow-hidden transition-all duration-300 origin-top ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pt-4 pb-6 flex flex-col gap-4">
          <NavLinks user={user} onLogout={handleLogout} onCloseMobile={handleCloseMobile} />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
