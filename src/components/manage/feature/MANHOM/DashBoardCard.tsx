import type { IconType } from 'react-icons';

interface DashBoardCardProps {
  icon: IconType;
  count: number;
  label: string;
}

const DashBoardCard = ({ icon: Icon, count, label }: DashBoardCardProps) => {
  return (
    <div className="flex items-center gap-4 flex-1 bg-white rounded-2xl px-6 py-5 shadow-sm">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 shrink-0">
        <Icon size={22} className="text-blue-400" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-2xl font-bold text-gray-900">{count}</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
    </div>
  );
};

export default DashBoardCard;
