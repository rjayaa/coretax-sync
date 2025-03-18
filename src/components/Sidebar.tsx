
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

// Custom event name for company change
const COMPANY_CHANGE_EVENT = 'company-changed';

const menuItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: 'Faktur',
    href: '/faktur',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    name: 'Sinkronisasi',
    href: '/sync-coretax',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    name: 'Export',
    href: '/export',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Get user companies from session
  const userCompanies = session?.user?.companies || [];
  
 // Fix for the Sidebar.tsx component

useEffect(() => {
  // This should only run once when the component mounts
  const savedCompany = localStorage.getItem('selectedCompany');
  if (savedCompany) {
    try {
      // Parse safely with error handling
      const parsedCompany = JSON.parse(savedCompany);
      // Only set if different from current state to avoid loops
      setSelectedCompany(prevSelected => {
        // Compare IDs or some unique identifier rather than the whole object
        if (!prevSelected || prevSelected.id !== parsedCompany.id) {
          return parsedCompany;
        }
        return prevSelected;
      });
    } catch (error) {
      console.error('Error parsing saved company:', error);
    }
  } else if (userCompanies.length > 0) {
    setSelectedCompany(prevSelected => {
      // Only set if not already set
      if (!prevSelected) {
        localStorage.setItem('selectedCompany', JSON.stringify(userCompanies[0]));
        return userCompanies[0];
      }
      return prevSelected;
    });
  }
  // This effect should only run when userCompanies changes, not on every render
}, [userCompanies]); // Add userCompanies as a dependency

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    localStorage.setItem('selectedCompany', JSON.stringify(company));
    setIsCompanyDropdownOpen(false);
    
    // Dispatch a custom event when company changes
    const companyChangeEvent = new CustomEvent(COMPANY_CHANGE_EVENT, { 
      detail: { company } 
    });
    window.dispatchEvent(companyChangeEvent);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  // Get user initials for the avatar
  const getUserInitials = () => {
    if (!session || !session.user || !session.user.username) return 'U';
    return session.user.username.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={`${
        isCollapsed ? 'w-20' : 'w-72'
      } bg-white shadow-xl transition-all duration-300 flex flex-col h-screen border-r border-gray-200`}
    >
      {/* Logo and Toggle Button */}
      <div className="py-6 px-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Coretax Sync</h1>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* User Profile and Company Selection */}
      <div className="border-b border-gray-200 bg-gray-50">
        {!isCollapsed ? (
          <div className="p-4">
            {/* User Profile */}
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold mr-3 shadow-sm">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{session?.user?.username || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email || 'user@example.com'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-gray-500 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                title="Logout"
                aria-label="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
            
            {/* Company Selection */}
            {userCompanies.length > 0 && (
              <div className="relative">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Company</label>
                <button
                  onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                  className="w-full flex items-center justify-between p-2.5 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  aria-expanded={isCompanyDropdownOpen}
                  aria-haspopup="listbox"
                >
                  <span className="truncate font-medium">
                    {selectedCompany ? selectedCompany.company_name : 'Select Company'}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isCompanyDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isCompanyDropdownOpen && userCompanies.length > 1 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto" role="listbox">
                    {userCompanies.map((company, index) => (
                      <button
                        key={index}
                        onClick={() => handleCompanySelect(company)}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 focus:bg-gray-100 transition-colors ${
                          selectedCompany?.company_code === company.company_code 
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                            : 'border-l-4 border-transparent'
                        }`}
                        role="option"
                        aria-selected={selectedCompany?.company_code === company.company_code}
                      >
                        <div className="font-medium">{company.company_name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">NPWP: {company.npwp_company}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
              {getUserInitials()}
            </div>
            {selectedCompany && (
              <div className="text-xs text-center mt-2 px-1 truncate w-full font-medium" title={selectedCompany.company_name}>
                {selectedCompany.company_code}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="mt-2 p-1.5 text-gray-500 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              title="Logout"
              aria-label="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                } flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  !isCollapsed ? 'justify-start' : 'justify-center'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={`${!isCollapsed ? 'mr-3' : ''}`}>{item.icon}</span>
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Version info at bottom */}
      {!isCollapsed && (
        <div className="p-4 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
          <p className="text-center">Coretax Sync v1.0</p>
        </div>
      )}
    </div>
  );
}