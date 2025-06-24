'use client';

import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/overzicht');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return null;
  }

  return (
    <section className="flex flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold mb-6">Welcome to Weight Tracker</h1>
      <p className="mb-8">Track your progress and reach your goals!</p>
      <div className="space-x-4">
        <Link href="/signup">
          <button className="px-6 py-2 bg-blue-500 text-white rounded">
            Create Account
          </button>
        </Link>
        <Link href="/login">
          <button className="px-6 py-2 border border-blue-500 rounded">
            Login
          </button>
        </Link>
      </div>
      <div className="mt-10 flex space-x-4">
        <div className="relative h-48 w-48">
          <Image
            src="/female.png"
            alt="Humorous female"
            layout="fill"
            objectFit="contain"
            priority
          />
        </div>
        <div className="relative h-48 w-48">
          <Image
            src="/male.png"
            alt="Humorous male"
            layout="fill"
            objectFit="contain"
            priority
          />
        </div>
      </div>
    </section>
  );
}
