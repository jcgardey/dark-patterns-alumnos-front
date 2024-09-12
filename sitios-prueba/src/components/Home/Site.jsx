import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

export const Site = ({ site }) => {
  const { t } = useTranslation();

  const onClick = (isDark) => {
    window.open(
      `${window.location.origin}${site.url}${isDark ? '?enabled=true' : ''}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="my-10 flex justify-between">
      <p className={`text-slate-700 text-lg my-2 `}>
        <span className={`text-black mr-2`}>{site.name}:</span>
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => onClick(false)}
          target="_blank"
          className="mb-4 px-6 text-slate-800 rounded p-2 bg-slate-100"
        >
          White
        </button>
        <button
          onClick={() => onClick(true)}
          target="_blank"
          className="mb-4 px-6 text-slate-50 rounded p-2 bg-slate-800"
        >
          Dark
        </button>
      </div>
    </div>
  );
};
