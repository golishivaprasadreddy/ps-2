import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../services/coinService';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const profileRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Load user for navbar display
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return;
    getUserProfile(userId, token)
      .then((res) => setUser(res.data))
      .catch(() => {});
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [profileOpen]);

  const initials = (user?.name || 'U').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-extrabold text-blue-700">Vitaversity</Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4 md:gap-6 text-sm">
          <Link className={`${isActive('/dashboard') ? 'text-blue-700 font-semibold' : 'text-slate-600 hover:text-blue-700'} transition`} to="/dashboard">Dashboard</Link>
          <Link className={`${isActive('/quiz') ? 'text-blue-700 font-semibold' : 'text-slate-600 hover:text-blue-700'} transition`} to="/quiz">Quiz</Link>
          <Link className={`${isActive('/courses') ? 'text-blue-700 font-semibold' : 'text-slate-600 hover:text-blue-700'} transition`} to="/courses">Courses</Link>
          <Link className={`${isActive('/forum') ? 'text-blue-700 font-semibold' : 'text-slate-600 hover:text-blue-700'} transition`} to="/forum">Forum</Link>
          {/* Profile menu (desktop) */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="ml-2 inline-flex items-center gap-2 px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                {initials}
              </span>
              <span className="text-slate-700 text-sm font-medium max-w-[180px] truncate">{user?.name || 'Profile'}</span>
            </button>
            {profileOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-60 rounded-lg border border-slate-200 bg-white shadow-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white text-sm font-bold">{initials}</div>
                  <div className="min-w-0">
                    <div className="text-slate-900 font-semibold truncate">{user?.name || 'User'}</div>
                    <div className="text-slate-600 text-xs truncate">{user?.email || 'email@example.com'}</div>
                  </div>
                </div>
                <div className="my-3 h-px bg-slate-200" />
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md bg-slate-900 text-white text-sm hover:bg-black">Logout</button>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? (
            // Close icon
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 11-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          ) : (
            // Hamburger icon
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      <div id="mobile-menu" className={`md:hidden ${menuOpen ? 'block' : 'hidden'} border-t border-slate-200 bg-white/95 backdrop-blur`}> 
        <div className="px-4 py-3 flex flex-col gap-3 text-sm">
          {/* Profile summary (mobile) */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white text-sm font-bold">{initials}</div>
            <div className="min-w-0">
              <div className="text-slate-900 font-semibold truncate">{user?.name || 'User'}</div>
              <div className="text-slate-600 text-xs truncate">{user?.email || 'email@example.com'}</div>
            </div>
          </div>
          <div className="h-px bg-slate-200" />
          <Link className={`${isActive('/dashboard') ? 'text-blue-700 font-semibold' : 'text-slate-700'} `} to="/dashboard">Dashboard</Link>
          <Link className={`${isActive('/quiz') ? 'text-blue-700 font-semibold' : 'text-slate-700'} `} to="/quiz">Quiz</Link>
          <Link className={`${isActive('/courses') ? 'text-blue-700 font-semibold' : 'text-slate-700'} `} to="/courses">Courses</Link>
          <Link className={`${isActive('/forum') ? 'text-blue-700 font-semibold' : 'text-slate-700'} `} to="/forum">Forum</Link>
          <button onClick={handleLogout} className="mt-2 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-black transition text-left w-fit">Logout</button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
