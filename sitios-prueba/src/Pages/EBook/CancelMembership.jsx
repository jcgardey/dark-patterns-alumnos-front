import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinishedTask } from '../../components/FinishedTask';
import { useTranslation } from 'react-i18next';

const RadioItem = ({ label, selected, onChange }) => (
  <div className="flex items-center my-3">
    <input
      className="form-check-input"
      type="radio"
      name="flexRadioDefault"
      id={label.replaceAll(' ', '')}
      checked={selected == label.replaceAll(' ', '')}
      onChange={() => onChange(label.replaceAll(' ', ''))}
    />
    <label
      className="text-sm mx-1 text-gray-800"
      htmlFor={label.replaceAll(' ', '')}
    >
      {label}
    </label>
  </div>
);

export const CancelMembership = ({}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [option, setOption] = useState('');
  const [error, setError] = useState(false);
  const [membershipCancelled, setMembershipCancelled] = useState(false);

  const dark = localStorage.getItem('dark') === 'true';

  const onSubmit = (e) => {
    e.preventDefault();
    if (!dark) {
      setMembershipCancelled(true);
    } else if (option !== '') {
      navigate('/ebook/books_offer');
    } else {
      setError(true);
    }
  };

  return (
    <div className="membership survey">
      <h1 className="text-3xl my-8">{t('Ebook.Survey.Before')}</h1>
      <form onSubmit={onSubmit}>
        <legend className="text-xl my-4">{t('Ebook.Survey.Which')}</legend>
        {error && (
          <p className="text-red-500 font-medium my-2">
            {t('Ebook.Survey.Choose')}
          </p>
        )}
        <RadioItem
          selected={option}
          onChange={setOption}
          label={t('Ebook.Survey.technical')}
        />
        <RadioItem
          selected={option}
          onChange={setOption}
          label={t('Ebook.Survey.enough')}
        />
        <RadioItem
          selected={option}
          onChange={setOption}
          label={t('Ebook.Survey.expensive')}
        />
        <RadioItem
          selected={option}
          onChange={setOption}
          label={t('Ebook.Survey.specific')}
        />
        <RadioItem
          selected={option}
          onChange={setOption}
          label={t('Ebook.Survey.Other')}
        />

        <div className="my-1 relative">
          <textarea
            className="w-full border border-gray-300 rounded py-8 px-2"
            id="floatingTextarea2"
          ></textarea>
          <label
            className="absolute top-0 left-0 p-2 text-sm text-gray-600"
            htmlFor="floatingTextarea2"
          >
            {t('Ebook.Survey.Please')}
          </label>
        </div>
        {dark ? (
          <button
            type="submit"
            className="my-2 underline text-sm text-fuchsia-500"
          >
            {t('Ebook.Survey.Send')}
          </button>
        ) : (
          <button
            className="bg-fuchsia-500 text-lg text-white p-2 rounded"
            type="submit"
          >
            {t('Ebook.Survey.Cancel')}
          </button>
        )}
      </form>
      <FinishedTask show={membershipCancelled} website="Roomio" />
    </div>
  );
};
