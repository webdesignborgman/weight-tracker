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
  getDocs,
  deleteDoc,
  updateDoc,
  setDoc,
} from 'firebase/firestore';

interface UserSettings {
  startWeight?: number;
  goalWeight?: number;
  startDate?: string;
  goalDate?: string;
  height?: number;
}

interface Goal {
  id: string;
  activity: string;
  frequency: number;
  completed?: number;
  weekStart?: string;
}

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
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [activity, setActivity] = useState('');
  const [frequency, setFrequency] = useState('');

  useEffect(() => {
    if (user) {
      const ref = doc(db, 'users', user.uid, 'profile', 'settings');
      getDoc(ref).then(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data() as UserSettings;
          setStartWeight(data.startWeight?.toString() ?? '');
          setGoalWeight(data.goalWeight?.toString() ?? '');
          setStartDate(data.startDate ?? '');
          setGoalDate(data.goalDate ?? '');
          setHeight(data.height?.toString() ?? '');
        }
      });

      fetchGoals();
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [loading, user, router]);

  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const resetGoalsIfNewWeek = async () => {
    if (!user) return;
    const monday = getMonday(new Date()).toISOString().split('T')[0];
    const snapshot = await getDocs(collection(db, 'users', user.uid, 'goals'));
    const updates: Promise<void>[] = [];
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (data.weekStart !== monday) {
        updates.push(updateDoc(docSnap.ref, { completed: 0, weekStart: monday }));
      }
    });
    await Promise.all(updates);
  };

  const fetchGoals = async () => {
    if (!user) return;
    await resetGoalsIfNewWeek();
    const snapshot = await getDocs(collection(db, 'users', user.uid, 'goals'));
    const result: Goal[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
    setGoals(result);
  };

  const saveSettings = async () => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'profile', 'settings');
    await setDoc(ref, {
      startWeight: parseFloat(startWeight),
      goalWeight: parseFloat(goalWeight),
      startDate,
      goalDate,
      height: parseFloat(height),
    }, { merge: true });
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveSettingsOnly = async () => {
    try {
      await saveSettings();
      showToast('Instellingen succesvol opgeslagen');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
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
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'goals', goalId));
    setGoals(goals.filter(goal => goal.id !== goalId));
    showToast('Sportdoel verwijderd');
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setActivity(goal.activity);
    setFrequency(goal.frequency.toString());
  };

  const handleSaveGoal = async () => {
    if (!user || !activity || !frequency) return;
    const monday = getMonday(new Date());
    const weekStart = monday.toISOString().split('T')[0];

    if (editingGoalId) {
      const ref = doc(db, 'users', user.uid, 'goals', editingGoalId);
      await updateDoc(ref, {
        activity,
        frequency: parseInt(frequency),
      });
      showToast('Sportdoel bijgewerkt');
    } else {
      await addDoc(collection(db, 'users', user.uid, 'goals'), {
        activity,
        frequency: parseInt(frequency),
        completed: 0,
        weekStart,
      });
      showToast('Sportdoel toegevoegd');
    }

    setActivity('');
    setFrequency('');
    setEditingGoalId(null);
    await fetchGoals();
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
          <input type="number" placeholder="Startgewicht (kg)" value={startWeight} onChange={e => setStartWeight(e.target.value)} className="w-full p-3 border rounded-lg bg-slate-700 text-white" />
          <input type="number" placeholder="Doelgewicht (kg)" value={goalWeight} onChange={e => setGoalWeight(e.target.value)} className="w-full p-3 border rounded-lg bg-slate-700 text-white" />
          <input type="date" placeholder="Startdatum" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-3 border rounded-lg bg-slate-700 text-white" />
          <input type="date" placeholder="Doeldatum" value={goalDate} onChange={e => setGoalDate(e.target.value)} className="w-full p-3 border rounded-lg bg-slate-700 text-white" />
          <input type="number" placeholder="Lengte (cm)" value={height} onChange={e => setHeight(e.target.value)} className="col-span-2 w-full p-3 border rounded-lg bg-slate-700 text-white" />
        </div>
        <button onClick={handleSaveSettingsOnly} className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold">
          Alleen Instellingen Opslaan
        </button>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-medium mb-4 text-white">Nieuwe Meting</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="date" placeholder="Datum" value={measurementDate} onChange={e => setMeasurementDate(e.target.value)} className="w-full p-3 border rounded-lg bg-slate-700 text-white" />
          <input type="number" placeholder="Gewicht (kg)" value={currentWeight} onChange={e => setCurrentWeight(e.target.value)} className="w-full p-3 border rounded-lg bg-slate-700 text-white" />
          <input type="number" placeholder="Taille (cm)" value={currentTaille} onChange={e => setCurrentTaille(e.target.value)} className="w-full p-3 border rounded-lg bg-slate-700 text-white" />
          {error && <p className="text-red-500 font-medium">{error}</p>}
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
            Instellingen + Meting Opslaan
          </button>
        </form>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-medium mb-4 text-white">Sportdoel {editingGoalId ? 'Bewerken' : 'Toevoegen'}</h2>
        <div className="space-y-4">
          <input type="text" placeholder="Activiteit" value={activity} onChange={e => setActivity(e.target.value)} className="w-full p-3 border rounded-lg bg-slate-700 text-white" />
          <input type="number" placeholder="Aantal keer per week" value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full p-3 border rounded-lg bg-slate-700 text-white" />
          <button onClick={handleSaveGoal} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
            {editingGoalId ? 'Wijzigingen Opslaan' : 'Sportdoel Toevoegen'}
          </button>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-medium mb-4 text-white">Jouw Sportdoelen</h2>
        {goals.length === 0 ? (
          <p className="text-gray-300">Geen doelen gevonden.</p>
        ) : (
          <ul className="space-y-2">
            {goals.map(goal => (
              <li key={goal.id} className="bg-slate-700 rounded-lg p-4 text-white flex justify-between items-center">
                <div>
                  <p className="font-semibold">{goal.activity}</p>
                  <p className="text-sm text-gray-300">{goal.completed ?? 0}/{goal.frequency}x deze week</p>
                </div>
                <div className="flex space-x-4">
                  <button onClick={() => handleEditGoal(goal)} className="text-blue-400 hover:text-blue-600 font-semibold">Bewerk</button>
                  <button onClick={() => handleDeleteGoal(goal.id)} className="text-red-400 hover:text-red-600 font-semibold">Verwijder</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
