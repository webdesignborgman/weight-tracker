'use client';

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

export default function InvoerPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const [startWeight, setStartWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [startDate, setStartDate] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [height, setHeight] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [currentTaille, setCurrentTaille] = useState('');
  const [measurementDate, setMeasurementDate] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const ref = doc(db, 'users', user.uid, 'profile', 'settings');
      getDoc(ref).then(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data() as any;
          setStartWeight(data.startWeight?.toString() ?? '');
          setGoalWeight(data.goalWeight?.toString() ?? '');
          setStartDate(data.startDate ?? '');
          setGoalDate(data.goalDate ?? '');
          setHeight(data.height?.toString() ?? '');
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [loading, user, router]);

  const saveSettings = async () => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'profile', 'settings');
    await setDoc(
      ref,
      {
        startWeight: parseFloat(startWeight),
        goalWeight: parseFloat(goalWeight),
        startDate,
        goalDate,
        height: parseFloat(height),
      },
      { merge: true }
    );
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveSettingsOnly = async () => {
    try {
      await saveSettings();
      showToast('Instellingen succesvol opgeslagen');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    try {
      await saveSettings();

      if (currentWeight && currentTaille && measurementDate) {
        await addDoc(collection(db, 'users', user!.uid, 'measurements'), {
          weight: parseFloat(currentWeight),
          taille: parseFloat(currentTaille),
          date: measurementDate,
          createdAt: serverTimestamp(),
        });
        showToast('Instellingen en meting opgeslagen');
      } else {
        showToast('Instellingen opgeslagen (geen meting)');
      }

      router.push('/overzicht');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="container mx-auto py-8 max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold text-white">Jouw Instellingen & Meting</h1>

      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in-out">
          {toastMessage}
        </div>
      )}

      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-medium mb-4 text-white">Instellingen</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">Startgewicht (kg)</label>
            <input
              type="number"
              step="0.1"
              value={startWeight}
              onChange={e => setStartWeight(e.target.value)}
              className="w-full p-3 border rounded-lg bg-slate-700 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">Doelgewicht (kg)</label>
            <input
              type="number"
              step="0.1"
              value={goalWeight}
              onChange={e => setGoalWeight(e.target.value)}
              className="w-full p-3 border rounded-lg bg-slate-700 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">Startdatum</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full p-3 border rounded-lg bg-slate-700 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">Doeldatum</label>
            <input
              type="date"
              value={goalDate}
              onChange={e => setGoalDate(e.target.value)}
              className="w-full p-3 border rounded-lg bg-slate-700 text-white"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-200">Lengte (cm)</label>
            <input
              type="number"
              step="1"
              value={height}
              onChange={e => setHeight(e.target.value)}
              className="w-full p-3 border rounded-lg bg-slate-700 text-white"
            />
          </div>
        </div>
        <button
          onClick={handleSaveSettingsOnly}
          type="button"
          className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
        >
          Alleen Instellingen Opslaan
        </button>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-medium mb-4 text-white">Nieuwe Meting</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">Datum</label>
            <input
              type="date"
              value={measurementDate}
              onChange={e => setMeasurementDate(e.target.value)}
              className="w-full p-3 border rounded-lg bg-slate-700 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">Gewicht (kg)</label>
            <input
              type="number"
              step="0.1"
              value={currentWeight}
              onChange={e => setCurrentWeight(e.target.value)}
              className="w-full p-3 border rounded-lg bg-slate-700 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-200">Taille (cm)</label>
            <input
              type="number"
              step="0.1"
              value={currentTaille}
              onChange={e => setCurrentTaille(e.target.value)}
              className="w-full p-3 border rounded-lg bg-slate-700 text-white"
            />
          </div>
          {error && <p className="text-red-500 font-medium">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            Instellingen + Meting Opslaan
          </button>
        </form>
      </div>
    </div>
  );
}
