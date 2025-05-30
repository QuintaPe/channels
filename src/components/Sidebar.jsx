import { useState, useEffect } from 'react';
import { ClerkProvider, SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

export default function Sidebar({ user }) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    useEffect(() => {
      const saved = localStorage.getItem('sidebarCollapsed');
      setIsCollapsed(saved ? JSON.parse(saved) : false);
  
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
  
      checkMobile();
      window.addEventListener('resize', checkMobile);
    
      return () => window.removeEventListener('resize', checkMobile);
    }, []);
  
    useEffect(() => {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);
  
    useEffect(() => {
      const event = new CustomEvent('sidebarStateChange', {
        detail: { isCollapsed: isMobile ? true : isCollapsed }
      });
      document.dispatchEvent(event);
    }, [isCollapsed, isMobile]);
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isMobileMenuOpen && !event.target.closest('.sidebar') && !event.target.closest('.menu-button')) {
          setIsMobileMenuOpen(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen]);
  
    const menuItems = [
      ...(window.Clerk?.user ? [{ name: 'Canales', icon: '⚽', path: '/' }] : []),
      { name: 'Partidos', icon: '📅', path: '/partidos' },
      { name: 'En directo', icon: '🔴', path: '/live' },
      { name: 'MotoGP', icon: '🏍️', path: '/motogp' },
      { name: 'MMA', icon: '🥊', path: '/mma' },
    ];

    return (
      <ClerkProvider publishableKey={import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY}>
        {isMobile && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="menu-button fixed top-4 right-4 bg-gradient-to-br from-card via-[#1a1d23] to-card rounded-full p-2 cursor-pointer z-[60] border border-[#404040] transition-colors duration-200"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <aside 
          className={`
            flex flex-col justify-between
            bg-gradient-to-br from-card via-[#1a1d23] to-card transition-all duration-300 ease-in-out h-screen sidebar
            ${isMobile 
              ? 'fixed w-[280px] -left-[280px] z-50' 
              : `${isCollapsed ? 'w-[88px]' : 'w-[280px]'}`
            }
            ${isMobileMenuOpen && isMobile ? 'translate-x-[280px]' : 'translate-x-0'}
            border-r border-[#252525]
          `}
        >
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-4 bottom-18 bg-[#252525] hover:bg-[#303030] rounded-full p-2 cursor-pointer z-[60] border border-[#404040] transition-colors duration-200"
            >
              <svg
                className={`w-4 h-4 text-white transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="p-4">
            <div className="flex items-center gap-3 mb-8 ml-1">
              <img src="/favicon.svg" alt="Logo" className="w-12 h-12 min-w-[48px]" />
              {(!isCollapsed || isMobile) && (
                <h1 className="text-white text-xl font-bold whitespace-nowrap">SportStream</h1>
              )}
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  className="flex items-center text-gray-300 hover:text-white hover:bg-[#252525] rounded-sm p-3 transition-colors duration-200 group"
                >
                  <span className="text-2xl w-[32px]">{item.icon}</span>
                  {(!isCollapsed || isMobile) && (
                    <span className="ml-3 whitespace-nowrap group-hover:translate-x-1 transition-transform duration-200">
                      {item.name}
                    </span>
                  )}
                </a>
              ))}
            </nav>
          </div>
          <div className="p-4 pl-6 pb-6">
            <SignedIn>
              <div class="flex items-center gap-2">
                <div class="w-10 h-10 mr-2 min-w-0 flex-shrink-0">
                  <UserButton />
                </div>
                <span class="text-white truncate">{user?.firstName + " " + user?.lastName}</span>
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton 
                mode="modal"
                class="w-10 h-10 cursor-pointer bg-gradient-to-br from-card via-[#1a1d23] to-card hover:bg-[#252525] text-white p-2 rounded-full border border-[#404040] transition-colors duration-200"
                appearance={{
                  baseTheme: dark,
                }}
              >	
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </SignInButton>
            </SignedOut>
          </div>
        </aside>
      </ClerkProvider>
    );
}