'use client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { parseISO, format, addDays, differenceInDays } from 'date-fns';

interface Measurement {
  date: string;
  taille: number;
}

interface Props {
  data: Measurement[];
  startDate: string;
  goalDate: string;
}

export default function TailleChart({ data, startDate, goalDate }: Props) {
  if (!startDate || !goalDate) return null;

  const start = parseISO(startDate);
  const end = parseISO(goalDate);
  const days = differenceInDays(end, start);

  // Build timeline with every date from start to goal
  const timeline = Array.from({ length: days + 1 }, (_, i) =>
    format(addDays(start, i), 'yyyy-MM-dd')
  );

  const merged = timeline.map(date => {
    const match = data.find(d => d.date === date);
    return {
      date,
      taille: match?.taille ?? null,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={merged}>
        <XAxis dataKey="date" stroke="#888" />
        <YAxis
          domain={[
            (dataMin: number) => Math.max(0, dataMin - 2),
            (dataMax: number) => dataMax + 2,
          ]}
        />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="taille"
          stroke="#e11d48"
          dot={{ r: 3 }}
          name="Taille (cm)"
          isAnimationActive={false}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
