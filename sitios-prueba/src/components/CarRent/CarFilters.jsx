import { useTranslation } from 'react-i18next';

const FilterGroup = ({
  title,
  name,
  availableFilters,
  selectedFilters,
  toggleFilter,
}) => {
  return (
    <div className="m-4">
      <p className="text-left text-xl font-bold">{title}</p>
      <div className="my-2">
        {availableFilters.map((filter, i) => (
          <p className="flex" key={i}>
            <label className="w-3/4 mx-2 text-left text-xl font-normal mb-1">
            <input
              type="checkbox"
              checked={selectedFilters.includes(filter.value)}
              value={filter.value}
              onChange={(e) => toggleFilter(name, e.target.value)}
            />
            <span className="pl-2">{filter.label}</span>
            </label>
          </p>
        ))}
      </div>
    </div>
  );
};

export const CarFilters = ({ availableFilters, filters, setFilters }) => {
  const { t } = useTranslation();

  const toggleFilter = (filterName, value) => {
    const newValue = parseInt(value) ? parseInt(value) : value;
    const newFilters = filters[filterName].includes(newValue)
      ? filters[filterName].filter((val) => val !== newValue)
      : [...filters[filterName], newValue];

    setFilters({ ...filters, [filterName]: newFilters });
  };

  return (
    <div className="w-full border border-color-white rounded p-2">
      <h3 className="text-center text-2xl text-white font-medium">
        {t('Rental.Vehicle.Filters.Title')}
        <FilterGroup
          title={t('Rental.Vehicle.Filters.Type')}
          name="type"
          availableFilters={availableFilters.type}
          selectedFilters={filters.type}
          toggleFilter={toggleFilter}
        />
        <FilterGroup
          title={t('Rental.Vehicle.Filters.Seats')}
          name="seats"
          availableFilters={availableFilters.seats}
          selectedFilters={filters.seats}
          toggleFilter={toggleFilter}
        />
      </h3>
    </div>
  );
};
