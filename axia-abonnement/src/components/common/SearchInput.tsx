import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SearchInput({
  value,
  placeholder = "Rechercher...",
  onChange,
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative flex-1 min-w-64 ${className}`}>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        size={16}
      />

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="ui-input w-full pl-11! pr-4"
      />
    </div>
  );
}