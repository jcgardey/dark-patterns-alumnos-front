import { useForm } from 'react-hook-form';
import { Modal } from '../../Modal';
import { createWebsite, updateWebsite } from '../../../services/dashboard';

export const EditWebsiteModal = ({ website, onClose }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: website.name ?? '',
      url: website.url ?? '',
      instructions: website.instructions ?? '',
      ux_analyzer_token: website.ux_analyzer_token ?? '',
    },
  });

  const onSubmit = (data) => {
    if (website.id) {
      updateWebsite(website.id, data).then((response) => onClose());
    } else {
      createWebsite(data).then((response) => onClose());
    }
  };

  return (
    <Modal title={`${website.id ? 'Editar' : 'Crear'} Sitio`} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-4">
          <label className="block font-bold">Nombre</label>
          <input
            className="h-10 w-full border border-gray-400 px-2"
            type="text"
            {...register('name', { required: true })}
          />
        </div>
        <div className="my-4">
          <label className="block font-bold">URL</label>
          <input
            className="h-10 w-full border border-gray-400 px-2"
            type="text"
            {...register('url', { required: true })}
          />
        </div>
        <div className="my-4">
          <label className="block font-bold">Instrucciones</label>
          <input
            className="h-10 w-full border border-gray-400 px-2"
            type="text"
            {...register('instructions', { required: true })}
          />
        </div>
        <div className="my-4">
          <label className="block font-bold">Token UX-analyzer</label>
          <input
            className="h-10 w-full border border-gray-400 px-2"
            type="text"
            {...register('ux_analyzer_token', { required: true })}
          />
        </div>
        <div className="my-4">
          <button className="bg-gray-600 text-white p-2 rounded" type="submit">
            Confirmar
          </button>
        </div>
      </form>
    </Modal>
  );
};
