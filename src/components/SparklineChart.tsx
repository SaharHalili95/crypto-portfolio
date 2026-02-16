import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface Props {
  data: number[];
  positive: boolean;
}

export default function SparklineChart({ data, positive }: Props) {
  const sampled = data.filter((_, i) => i % 4 === 0).map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={sampled}>
        <Line type="monotone" dataKey="v" stroke={positive ? '#10B981' : '#EF4444'} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
