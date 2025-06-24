// components/BmiCard.tsx
'use client';

import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  bmi: number;
}

function getBmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: 'Ondergewicht', color: 'text-yellow-400' };
  if (bmi < 25) return { label: 'Normaal', color: 'text-green-500' };
  if (bmi < 30) return { label: 'Overgewicht', color: 'text-orange-400' };
  return { label: 'Obesitas', color: 'text-red-500' };
}

export default function BmiCard({ bmi }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { label, color } = getBmiCategory(bmi);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center text-center">
      <div className="relative w-24 h-24 mb-3">
        <div className="w-full h-full rounded-full border-8 border-blue-500 flex items-center justify-center text-2xl font-bold text-gray-900">
          {bmi.toFixed(1)}
        </div>
      </div>
      <p className={`text-sm font-medium ${color}`}>{label}</p>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1"
      >
        <InformationCircleIcon className="w-4 h-4" />
        Wat is BMI?
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-semibold mb-2">BMI Uitleg</Dialog.Title>
            <p className="text-sm text-gray-700 mb-4">
              Body Mass Index (BMI) is een maat voor het gewicht in verhouding tot de lengte:
            </p>
            <ul className="text-sm text-gray-800 space-y-1">
              <li>&lt; 18.5 — Ondergewicht</li>
              <li>18.5 – 24.9 — Normaal gewicht</li>
              <li>25 – 29.9 — Overgewicht</li>
              <li>&ge; 30 — Obesitas</li>
            </ul>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sluiten
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
