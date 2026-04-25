interface Props {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function PillButton({ label, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
        active
          ? "border-bosque-600 bg-bosque-600 text-white"
          : "border-black/5 bg-white text-carbon hover:border-bosque-200"
      }`}
    >
      {label}
    </button>
  );
}
