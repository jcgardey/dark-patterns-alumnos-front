import { Seat } from './Seat';

export const SeatsRow = ({ number, seats, onSelect, isVIP, selected }) => (
  <div className={`flex my-4`}>
    <div className="seats" type="A">
      {Object.keys(seats).map((name, i) => (
        <Seat
          key={`${number}${name}`}
          value={`${number}${name}`}
          isVIP={isVIP}
          save={seats[name].save}
          onSelect={onSelect}
          disabled={seats[name].ocuppied}
          selected={selected}
        />
      ))}
    </div>
  </div>
);
