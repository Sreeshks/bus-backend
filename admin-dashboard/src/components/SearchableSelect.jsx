import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

const SearchableSelect = ({ options, value, onChange, placeholder, icon: Icon, label, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter options
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
            {label && <label className="text-xs font-semibold text-slate-500 ml-1 uppercase mb-1 block">{label}</label>}

            <div
                className={`w-full bg-slate-50 border ${isOpen ? 'border-primary-500 ring-2 ring-primary-100' : 'border-slate-200'} rounded-xl px-4 py-2.5 flex items-center justify-between cursor-pointer transition-all hover:bg-white hover:border-slate-300 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <div className="flex items-center space-x-3 overflow-hidden">
                    {Icon && <Icon size={18} className={isOpen ? 'text-primary-500' : 'text-slate-400'} />}
                    <span className={`block truncate ${selectedOption ? 'text-slate-900' : 'text-slate-400'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <div className="flex items-center">
                    {selectedOption && !disabled && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
                            className="p-1 hover:bg-slate-200 rounded-full mr-1 text-slate-400"
                        >
                            <X size={14} />
                        </button>
                    )}
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden text-sm animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-slate-50">
                        <div className="flex items-center bg-slate-50 rounded-lg px-2 border border-slate-100">
                            <Search size={14} className="text-slate-400 shrink-0" />
                            <input
                                type="text"
                                className="w-full bg-transparent border-none p-2 focus:ring-0 text-slate-700 outline-none placeholder:text-slate-400"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`px-3 py-2.5 rounded-lg cursor-pointer transition-colors flex items-center justify-between group ${option.value === value ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-slate-50 text-slate-700'}`}
                                >
                                    <span>{option.label}</span>
                                    {option.value === value && <span className="w-2 h-2 rounded-full bg-primary-500"></span>}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-center text-slate-400 italic">No matches found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
