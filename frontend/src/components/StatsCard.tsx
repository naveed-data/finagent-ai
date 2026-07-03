type StatsCardProps = {
  title: string;
  value: string;
  icon: string;
};

function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>

      <div className="text-3xl">{icon}</div>
    </div>
  );
}

export default StatsCard;
