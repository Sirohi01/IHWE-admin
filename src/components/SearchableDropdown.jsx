import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const SearchableDropdown = ({ options, value, onChange, placeholder = "Select...", name, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const dropdownRef = useRef(null);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (selectedValue) => {
        onChange({ target: { name, value: selectedValue } });
        setIsOpen(false);
        setSearchTerm('');
        setDebouncedSearch('');
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                className={`w-full px-3 py-2 border-2 border-gray-300 flex justify-between items-center ${disabled ? 'bg-slate-50 cursor-not-allowed text-slate-500' : 'bg-white focus-within:border-[#23471d] cursor-pointer'}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={`text-sm font-semibold ${selectedOption ? 'text-black' : 'text-gray-400'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-60 flex flex-col">
                    <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 text-sm focus:outline-none focus:border-[#23471d]"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                    <ul className="overflow-y-auto overflow-x-hidden flex-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <li
                                    key={index}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#eef5ec] hover:text-[#23471d] font-semibold ${value === option.value ? 'bg-[#eef5ec] text-[#23471d]' : 'text-gray-700'
                                        }`}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    {option.label}
                                </li>
                            ))
                        ) : (
                            <li className="px-3 py-3 text-sm text-gray-500 text-center font-medium">
                                No results found
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchableDropdown;
