import { useState } from 'react';

export const Autocomplete = ({
  name,
  placeholder,
  value,
  onChange,
  suggestedValues,
  inputClassName,
  optionClassName = '',
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const updateAutocomplete = (newValue) => {
    onChange(newValue);
    setShowSuggestions(
      newValue.length >= 3 && filterValues(newValue).length > 0
    );
  };

  const saveValue = (newValue) => {
    onChange(newValue);
    setShowSuggestions(false);
  };

  const filterValues = (targetValue) =>
    suggestedValues.filter((v) =>
      v.toLowerCase().includes(targetValue.toLowerCase())
    );

  return (
    <>
      <input
        type="text"
        widget-type="text"
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(e) => updateAutocomplete(e.target.value)}
        className={inputClassName ? inputClassName : 'w-full rounded px-2 h-9'}
      />
      {showSuggestions && (
        <div className="absolute my-1 w-full bg-white border border-gray-100 rounded p-2">
          {filterValues(value).map((option, i) => (
            <p
              key={i}
              onClick={() => saveValue(option)}
              className={`my-1 text-lg cursor-pointer hover:bg-gray-700 hover:text-white ${optionClassName}`}
            >
              {option}
            </p>
          ))}
        </div>
      )}
    </>
  );
};
