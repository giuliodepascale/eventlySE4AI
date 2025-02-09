'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BiSearch } from 'react-icons/bi';

interface Suggestion {
  id: string;
  name: string;
}

const Search = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('events'); // "events" oppure "organizations"
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // Per gestire il debounce
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  // Per gestire il click fuori dal componente
  const containerRef = useRef<HTMLDivElement>(null);

  // Funzione per fetchare i suggerimenti in maniera dinamica
  const fetchSuggestions = async (query: string, type: string) => {
    if (query.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `/api/suggestions?query=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      // Assumiamo che l'API restituisca { suggestions: Suggestion[] }
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Debounce: ogni volta che la query o il tipo cambiano, attendi 300ms prima di fare la fetch
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    if (searchQuery.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(searchQuery, searchType);
    }, 300);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchQuery, searchType]);

  // Chiudi il dropdown se clicchi fuori dal componente
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Esegue la ricerca (quando l'utente clicca sull'icona o seleziona un suggerimento)
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(
      `/search?query=${encodeURIComponent(searchQuery)}&type=${encodeURIComponent(searchType)}`
    );
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className="
          flex
          items-center
          border-[1px]
          w-full
          md:w-auto
          py-2
          rounded-full
          shadow-sm
          hover:shadow-md
          transition
          cursor-pointer
        "
      >
        {/* Input controllato */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Cerca eventi o organizzazioni..."
          className="flex-grow px-6 py-2 focus:outline-none"
        />

        {/* Select per scegliere il tipo di ricerca (visibile su schermi grandi) */}
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="hidden sm:block px-4"
        >
          <option value="events">Eventi</option>
          <option value="organizations">Organizzazioni</option>
        </select>

        {/* Bottone per la ricerca */}
        <div
          onClick={handleSearch}
          className="p-2 bg-blue-600 rounded-full text-white cursor-pointer mr-2"
        >
          <BiSearch size={18} />
        </div>
      </div>

      {/* Dropdown dinamico dei suggerimenti */}
      {showDropdown && (
        <div className="absolute z-10 bg-white border border-gray-300 w-full rounded-md mt-1">
          {loadingSuggestions ? (
            <div className="px-4 py-2 text-sm text-gray-500">Caricamento suggerimenti...</div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion.id}
                  onClick={() => {
                    setSearchQuery(suggestion.name);
                    setShowDropdown(false);
                    router.push(
                      `/search?query=${encodeURIComponent(suggestion.name)}&type=${encodeURIComponent(searchType)}`
                    );
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {suggestion.name}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">Nessun risultato trovato</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
