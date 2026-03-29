import { useNavigate } from 'react-router-dom';

interface BackBtnProps {
  label: string;
  to?: string;
}

const BackBtn = ({ label, to }: BackBtnProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 text-base font-bold text-gray-900"
    >
      <span className="text-lg leading-none">{'<'}</span>
      <span>{label}</span>
    </button>
  );
};

export default BackBtn;
