// components/Header.tsx
'use client';

import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function Header() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold text-blue-600">
        Weight Tracker
      </Link>

      <nav className="flex items-center gap-6">
        <Link href="/overzicht" className="text-gray-700 hover:text-blue-500 font-medium">Overzicht</Link>
        <Link href="/invoer" className="text-gray-700 hover:text-blue-500 font-medium">Invoer</Link>
        <Link href="/about" className="text-gray-700 hover:text-blue-500 font-medium">About</Link>

        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 focus:outline-none"
            >
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="profile"
                  width={32}
                  height={32}
                  className="rounded-full border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-white">
                  {user.displayName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <span className="text-gray-700 font-medium hidden sm:inline">
                {user.displayName?.split(' ')[0]}
              </span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg py-2 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Uitloggen
                </button>
              </div>
            )}
          </div>
        ) : null}
      </nav>
    </header>
  );
}
