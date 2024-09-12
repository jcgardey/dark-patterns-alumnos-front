export const Seat = ({
  value,
  onSelect,
  isVIP,
  save = false,
  disabled = false,
  selected,
}) => (
  <div className="seat">
    <input
      type="radio"
      disabled={disabled}
      name="seat"
      id={value}
      value={value}
      onChange={() => onSelect({ value, isVIP, save })}
      checked={selected?.value == value}
    />
    <label
      htmlFor={value}
      className={`${save ? 'save' : ''} ${isVIP ? 'vip' : ''}`}
    >
      {disabled ? 'Ocuppied' : value}
    </label>
  </div>
);
