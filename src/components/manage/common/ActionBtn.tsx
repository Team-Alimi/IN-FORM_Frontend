interface ActionBtnProps {
  label: string;
  color?: string;
  onClick?: () => void;
}

const ActionBtn = ({ label, color = 'text-gray-600', onClick }: ActionBtnProps) => {
  return (
    <button onClick={onClick} className={`text-sm ${color}`}>
      {label}
    </button>
  );
};

export default ActionBtn;
