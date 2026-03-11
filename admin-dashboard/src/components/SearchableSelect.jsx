import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { clsx } from 'clsx';

const SearchableSelect = ({ options, value, onChange, placeholder, icon: Icon, label, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative" ref={containerRef}>
            {label && (
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                    {label}
                </label>
            )}

            <div
                className={clsx(
                    "w-full border rounded-xl px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-all duration-200",
                    isOpen
                        ? "bg-white border-primary-400 ring-[3px] ring-primary-100 shadow-sm"
                        : "bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300",
                    disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className="flex items-center space-x-2.5 overflow-hidden min-w-0">
                    {Icon && (
                        <Icon size={16} className={clsx(
                            "shrink-0 transition-colors",
                            isOpen ? "text-primary-500" : "text-slate-400"
                        )} />
                    )}
                    <span className={clsx(
                        "block truncate text-sm",
                        selectedOption ? "text-slate-800 font-medium" : "text-slate-400"
                    )}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <div className="flex items-center shrink-0 ml-2">
                    {selectedOption && !disabled && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
                            className="p-0.5 hover:bg-slate-100 rounded-full mr-1 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={13} />
                        </button>
                    )}
                    <ChevronDown size={15} className={clsx(
                        "text-slate-400 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/60 overflow-hidden">
                    <div className="p-2 border-b border-slate-50">
                        <div className="flex items-center bg-slate-50 rounded-lg px-2.5 border border-slate-100">
                            <Search size={13} className="text-slate-400 shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full bg-transparent border-none p-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="max-h-52 overflow-y-auto p-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={clsx(
                                        "px-3 py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between text-sm",
                                        option.value === value
                                            ? "bg-primary-50 text-primary-700 font-medium"
                                            : "hover:bg-slate-50 text-slate-600 hover:text-slate-800"
                                    )}
                                >
                                    <span>{option.label}</span>
                                    {option.value === value && <Check size={14} className="text-primary-500" />}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center">
                                <p className="text-sm text-slate-400">No results found</p>
                                <p className="text-xs text-slate-300 mt-1">Try a different search term</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
