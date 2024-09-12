import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAllWebsites,
  createWebsiteGroup,
  updateWebsiteGroup,
} from '../../../services/dashboard';

export const EditWebsiteGroupForm = ({ website_group }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: website_group.name ?? '',
      order: website_group.order ?? '',
    },
  });
  const [websites, setWebsites] = useState([]);
  const [selectedWebsites, setSelectedWebsites] = useState(
    website_group.websites ?? []
  );

  const navigate = useNavigate();

  useEffect(() => {
    getAllWebsites().then((data) => setWebsites(data));
  }, []);

  const handleWebsiteSelection = (event) => {
    setSelectedWebsites([
      ...selectedWebsites,
      websites.find((w) => w.id === parseInt(event.target.value)),
    ]);
  };

  const onDeleteWebsite = (website) => {
    setSelectedWebsites(selectedWebsites.filter((w) => w.id !== website.id));
  };

  const onSubmit = (data) => {
    const params = {
      ...data,
      websites: selectedWebsites.map((w, index) => ({
        website_id: w.id,
        order: index + 1,
      })),
    };
    if (website_group.id) {
      updateWebsiteGroup(website_group.id, params).then((response) => {
        navigate('/dashboard');
      });
    } else {
      createWebsiteGroup(params).then((response) => {
        navigate('/dashboard');
      });
    }
  };

  const labelClasses = 'block font-medium';
  const inputClasses = 'border border-gray-500 rounded w-full h-10 p-1';

  return (
    <div className="my-8 w-1/3 mx-auto">
      <Link className="underline text-blue-600" to="/dashboard">
        Dashboard
      </Link>
      <h1 className="text-center text-3xl font-medium">Crear Variante</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="my-4">
          <label className={labelClasses}>Nombre</label>
          <input
            className={inputClasses}
            type="text"
            {...register('name', { required: true })}
          />
        </div>
        <div className="my-4">
          <label className={labelClasses}>Orden en el round robin</label>
          <select
            className={inputClasses}
            {...register('order', { required: true })}
          >
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
            <option>7</option>
            <option>8</option>
            <option>9</option>
            <option>10</option>
          </select>
        </div>
        <div className="my-8">
          <h3 className="text-lg font-medium">Agregar Sitio</h3>
          <div className="my-4">
            <select
              className={inputClasses}
              type="text"
              name="website_name"
              onChange={handleWebsiteSelection}
            >
              <option value="">Elegir Sitio</option>
              {websites.map((website) => (
                <option key={website.id} value={website.id}>
                  {website.name}
                  {website.url.includes('enabled=true') ? ' (Dark)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="my-8">
          <h3 className="text-lg font-medium">Sitios agregados</h3>
          <ol>
            {selectedWebsites.map((website, i) => (
              <li className="flex w-full justify-between my-2" key={i}>
                <p className="font-light">
                  {website.name}
                  {website.url.includes('enabled=true') && (
                    <span className="font-bold mx-1">Dark</span>
                  )}
                </p>

                <button
                  onClick={() => onDeleteWebsite(website)}
                  className="mx-2 underline text-blue-600"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="my-12">
          <button
            disabled={websites.length === 0}
            className="rounded bg-sky-700 text-white p-2 disabled:opacity-70"
            type="submit"
          >
            Crear variante
          </button>
        </div>
      </form>
    </div>
  );
};
