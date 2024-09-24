import { Confirmation } from './Confirmation';
import { Modal } from './Modal';
import { useTranslation } from 'react-i18next';

export const FinishedTask = ({ show, website, data = {} }) => {
  const { t } = useTranslation();

  const closeTab = () => {
    window.close();
  };

  if (!show) {
    return null;
  }
  return (
    <Modal title={t('Common.TaskFinished')}>
      <Confirmation />
    </Modal>
  );
};
