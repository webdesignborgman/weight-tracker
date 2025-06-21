'use client';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';

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

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const qSnap = await getDocs(collection(db, 'users', user.uid, 'measurements'));
        const measurements = qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Measurement[];
        setData(
          measurements
            .filter(m => m.date)
            .sort((a, b) => a.date.localeCompare(b.date))
        );

        const settingsSnap = await getDoc(doc(db, 'users', user.uid, 'profile', 'settings'));
        if (settingsSnap.exists()) {
          const s = settingsSnap.data();
          setStartWeight(s.startWeight);
          setGoalWeight(s.goalWeight);
          setStartDate(s.startDate);
          setGoalDate(s.goalDate);
        }
      };
      fetchData();
    }
  }, [user]);

  if (loading || !user) return null;

  const latest = data[data.length - 1];

  return (
    <div className="mx-auto py-6 px-4 max-w-4xl sm:max-w-3xl md:max-w-2xl space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 mb-1">Gewicht</h2>
          <p className="text-3xl font-bold text-gray-900">{latest?.weight ?? '-'} kg</p>
          <p className="text-sm text-gray-400">t.o.v. vorige week: 0 kg</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 mb-1">Taille</h2>
          <p className="text-3xl font-bold text-gray-900">{latest?.taille ?? '-'} cm</p>
          <p className="text-sm text-gray-400">t.o.v. vorige week: 0 cm</p>
        </div>
      </div>

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
