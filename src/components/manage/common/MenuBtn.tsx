import type { IconType } from 'react-icons';

interface MenuBtnProps {
  icon: IconType;
  label: string;
  active?: boolean;
  variant?: 'default' | 'danger';
  onClick?: () => void;
}

const MenuBtn = ({ icon: Icon, label, active = false, variant = 'default', onClick }: MenuBtnProps) => {
  const textColor =
    variant === 'danger'
      ? 'text-red-400'
      : active
        ? 'text-gray-900 font-medium'
        : 'text-gray-400';

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg ${textColor}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
};

export default MenuBtn;
