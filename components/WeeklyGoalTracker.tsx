'use client';

import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { Plus, Minus } from 'lucide-react';
import clsx from 'clsx';

interface Goal {
  id: string;
  activity: string;
  frequency: number;
  completed: number;
}

export default function WeeklyGoalTracker() {
  const [user] = useAuthState(auth);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (user) fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;
    const snapshot = await getDocs(collection(db, 'users', user.uid, 'goals'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
    setGoals(data);
  };

  const updateCompleted = async (goalId: string, delta: number) => {
    if (!user) return;
    setGoals(prev =>
      prev.map(g =>
        g.id === goalId
          ? { ...g, completed: Math.max(0, Math.min(g.frequency, g.completed + delta)) }
          : g
      )
    );
    const goalRef = doc(db, 'users', user.uid, 'goals', goalId);
    const updatedGoal = goals.find(g => g.id === goalId);
    if (!updatedGoal) return;
    await updateDoc(goalRef, {
      completed: Math.max(0, Math.min(updatedGoal.frequency, updatedGoal.completed + delta))
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Weekdoelen</h2>
      <ul className="space-y-4">
        {goals.map(goal => {
          const progress = goal.completed / goal.frequency;
          const progressColor =
            progress === 1
              ? 'bg-green-500'
              : progress === 0
              ? 'bg-red-500'
              : progress > 0.66
              ? 'bg-yellow-400'
              : progress > 0.33
              ? 'bg-orange-400'
              : 'bg-pink-400';

          return (
            <li key={goal.id} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-gray-700">{goal.activity}</p>
                <div className="relative w-full h-3 mt-2 bg-gray-200 rounded-full">
                  <div
                    className={clsx('h-full rounded-full transition-all duration-300', progressColor)}
                    style={{ width: `${progress * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {goal.completed}/{goal.frequency} keer deze week
                </p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => updateCompleted(goal.id, -1)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                >
                  <Minus size={16} />
                </button>
                <button
                  onClick={() => updateCompleted(goal.id, 1)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                >
                  <Plus size={16} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
