import { useEffect, useState } from 'react';
import {
  deleteWebsite,
  downloadWebsiteSamples,
  getAllWebsites,
} from '../../services/dashboard';
import { EditWebsiteModal } from '../../components/Dashboard/Websites/EditWebsiteModal';
import { Link } from 'react-router-dom';
import { saveFile } from '../../utils/file';

export const WebsitesPage = () => {
  const [websites, setWebsites] = useState([]);

  const [selectedWebsite, setSelectedWebsite] = useState(null);

  useEffect(() => {
    getAllWebsites().then((data) => setWebsites(data));
  }, []);

  const onClose = () => {
    setSelectedWebsite(null);
  };

  const handleCreateWebsite = () => {
    setSelectedWebsite({
      name: '',
      url: '',
      instructions: '',
      ux_analyzer_token: '',
    });
  };

  const handleDelete = (website) => {
    deleteWebsite(website.id).then(() => {
      setWebsites(websites.filter((w) => w.id !== website.id));
    });
  };

  return (
    <div className="w-1/2 mx-auto p-8">
      <h1 className="text-center text-3xl font-bold">Sitios</h1>
      <div className="my-4">
        <Link className="underline text-blue-600" to="/dashboard">
          Volver
        </Link>
        <button
          className="underline text-blue-600 mx-4"
          onClick={handleCreateWebsite}
        >
          Crear Sitio
        </button>
      </div>
      <div className="my-4">
        {websites.map((website) => (
          <div className="flex justify-between my-4" key={website.id}>
            <p className="w-1/3">
              {website.name}{' '}
              {website.url.includes('enabled=true') && (
                <span className="font-bold">Dark</span>
              )}{' '}
            </p>
            <p className="w-1/3">{website.ux_analyzer_token}</p>
            <button
              className="underline text-blue-600"
              type="button"
              onClick={() => setSelectedWebsite(website)}
            >
              Editar
            </button>
            <button
              className="underline text-blue-600 mx-2"
              onClick={() => handleDelete(website)}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
      {selectedWebsite && (
        <EditWebsiteModal website={selectedWebsite} onClose={onClose} />
      )}
    </div>
  );
};
