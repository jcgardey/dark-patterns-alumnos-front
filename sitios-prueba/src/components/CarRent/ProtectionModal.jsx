import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';

export const ProtectionModal = ({ onClose, onNext }) => {
  const { t } = useTranslation();

  return (
    <Modal title={t('Rental.Protection.NoProtection.Title')} onClose={onClose}>
      <p>{t('Rental.Protection.NoProtection.Description')}</p>
      <div className="flex w-full mx-auto my-4 justify-evenly">
        <button
          className="border-2 text-slate-700 border-slate-700 p-2"
          onClick={onNext}
        >
          {t('Rental.Protection.NoProtection.Skip')}
        </button>
        <button className="bg-slate-700 text-white p-2 mx-3" onClick={onClose}>
          {t('Rental.Protection.NoProtection.Add')}
        </button>
      </div>
    </Modal>
  );
};
