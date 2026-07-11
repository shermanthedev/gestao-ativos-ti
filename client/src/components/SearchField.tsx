import { Search as SearchIcon } from '@mui/icons-material'

type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}

export default function SearchField({ value, onChange, placeholder, className = '' }: SearchFieldProps) {
  return (
    <div className={`flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-200 ${className}`}>
      <SearchIcon className="text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="flex-1 outline-none text-sm"
      />
    </div>
  )
}
