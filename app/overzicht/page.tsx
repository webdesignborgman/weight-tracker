'use client';

import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import BmiCard from '../../components/BmiCard';
import WeeklyGoalTracker from '../../components/WeeklyGoalTracker';

const WeightChart = dynamic(() => import('../../components/WeightChart'), { ssr: false });
const TailleChart = dynamic(() => import('../../components/TailleChart'), { ssr: false });

interface Measurement {
  id: string;
  date: string;
  weight: number;
  taille: number;
}

export default function OverzichtPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [data, setData] = useState<Measurement[]>([]);
  const [startWeight, setStartWeight] = useState<number | null>(null);
  const [goalWeight, setGoalWeight] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [goalDate, setGoalDate] = useState<string>('');
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Haal alle metingen op en sorteer op datum
      const qSnap = await getDocs(collection(db, 'users', user.uid, 'measurements'));
      const measurements = qSnap.docs
        .map(doc => ({ id: doc.id, ...(doc.data() as Omit<Measurement, 'id'>) }))
        .filter(m => m.date)
        .sort((a, b) => a.date.localeCompare(b.date));
      setData(measurements);

      // Haal gebruikersinstellingen (start/goal) op
      const settingsSnap = await getDoc(doc(db, 'users', user.uid, 'profile', 'settings'));
      if (settingsSnap.exists()) {
        const s = settingsSnap.data();
        setStartWeight(s.startWeight);
        setGoalWeight(s.goalWeight);
        setStartDate(s.startDate);
        setGoalDate(s.goalDate);
        setHeight(s.height ?? null);
      }
    };
    fetchData();
  }, [user]);

  if (loading || !user) {
    return null;
  }

  const latest = data[data.length - 1] ?? null;
  const prev = data.length > 1 ? data[data.length - 2] : null;

  // Bereken BMI
  const bmi =
    latest && height
      ? (latest.weight / Math.pow(height / 100, 2)).toFixed(1)
      : null;

  // Bereken verschil t.o.v. vorige meting
  const weightDiff =
    prev && latest ? (latest.weight - prev.weight).toFixed(1) : null;
  const tailleDiff =
    prev && latest ? (latest.taille - prev.taille).toFixed(1) : null;

  return (
    <div className="mx-auto py-6 px-4 max-w-4xl sm:max-w-3xl md:max-w-2xl space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Gewicht Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center text-center">
          <h2 className="text-sm font-semibold text-gray-500 mb-1">Gewicht</h2>
          <p className="text-3xl font-bold text-gray-900">
            {latest?.weight ?? '-'} kg
          </p>
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-400">t.o.v. vorige meting:</p>
            <p className={`text-sm font-semibold ${
              weightDiff !== null && Number(weightDiff) < 0 ? 'text-green-500' : ''
            } ${
              weightDiff !== null && Number(weightDiff) > 0 ? 'text-red-500' : ''
            }`}
            >
              {weightDiff === null
                ? '–'
                : `${Number(weightDiff) > 0 ? '+' : ''}${weightDiff} kg`}
            </p>
          </div>
        </div>

        {/* Taille Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center text-center">
          <h2 className="text-sm font-semibold text-gray-500 mb-1">Taille</h2>
          <p className="text-3xl font-bold text-gray-900">
            {latest?.taille ?? '-'} cm
          </p>
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-400">t.o.v. vorige meting:</p>
            <p className={`text-sm font-semibold ${
              tailleDiff !== null && Number(tailleDiff) < 0 ? 'text-green-500' : ''
            } ${
              tailleDiff !== null && Number(tailleDiff) > 0 ? 'text-red-500' : ''
            }`}
            >
              {tailleDiff === null
                ? '–'
                : `${Number(tailleDiff) > 0 ? '+' : ''}${tailleDiff} cm`}
            </p>
          </div>
        </div>

        {/* BMI Card */}
        <BmiCard bmi={bmi ? parseFloat(bmi) : 0} />
      </div>

      {/* Weekdoelen Tracker */}
      <WeeklyGoalTracker />

      {/* Gewicht Over Tijd Grafiek */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Gewicht Over Tijd</h3>
        <div className="w-full h-64 sm:h-80">
          <WeightChart
            data={data}
            startWeight={startWeight}
            goalWeight={goalWeight}
            startDate={startDate}
            goalDate={goalDate}
          />
        </div>
      </div>

      {/* Taille Over Tijd Grafiek */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Taille Over Tijd</h3>
        <div className="w-full h-64 sm:h-80">
          <TailleChart
            data={data}
            startDate={startDate}
            goalDate={goalDate}
          />
        </div>
      </div>
    </div>
  );
}