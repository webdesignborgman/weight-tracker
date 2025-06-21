'use client';
import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface Props {
  mode: 'login' | 'signup';
}

export default function AuthModal({ mode }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      let userCredential;
      if (mode === 'login') {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }

      const user = userCredential.user;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          email: user.email,
          provider: user.providerData[0]?.providerId,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      setSuccess(true);
      router.push('/overzicht');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Onbekende fout opgetreden.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(undefined);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photo: user.photoURL,
          provider: user.providerData[0]?.providerId,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      setSuccess(true);
      router.push('/overzicht');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Google login mislukt.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 capitalize">
          {mode === 'login' ? 'Login' : 'Create Account'}
        </h2>

        {success && (
          <p className="mb-4 text-green-600 font-medium text-center">Succesvol ingelogd!</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full p-3 border rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full p-3 border rounded bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            {loading ? 'Even wachten...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="relative text-center my-4 text-gray-500">of</div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 bg-white border hover:bg-gray-100 rounded-lg font-medium flex items-center justify-center space-x-3 text-gray-700"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 533.5 544.3"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.3H272.1v95.1h146.6c-6.3 33.4-25.3 61.7-54 80.5v66.7h87.2c51-47 81.6-116.4 81.6-192z"
              fill="#4285F4"
            />
            <path
              d="M272.1 544.3c73.7 0 135.6-24.4 180.7-66.2l-87.2-66.7c-24.2 16.2-55.2 25.6-93.5 25.6-71.8 0-132.6-48.5-154.3-113.7H28.9v71.4c45.1 89 137.5 149.6 243.2 149.6z"
              fill="#34A853"
            />
            <path
              d="M117.8 323.3c-10.3-30.6-10.3-63.3 0-93.9V157.9H28.9c-37.6 73.4-37.6 160.4 0 233.8l88.9-68.4z"
              fill="#FBBC05"
            />
            <path
              d="M272.1 107.7c39.6-.6 77.5 13.7 106.5 39.9l79.2-79.2C414.6 23.4 344.9-1.7 272.1 0 166.4 0 74 60.6 28.9 149.6l88.9 68.4c21.7-65.2 82.5-113.7 154.3-113.7z"
              fill="#EA4335"
            />
          </svg>
          <span>Inloggen met Google</span>
        </button>

        {error && <p className="mt-4 text-red-600 font-medium text-center">{error}</p>}
      </div>
    </div>
  );
}
