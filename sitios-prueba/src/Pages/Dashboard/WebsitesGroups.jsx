import { useEffect, useState } from 'react';
import {
  downloadUserSessions,
  downloadWebsiteSamples,
  getAllWebsitesGroups,
} from '../../services/dashboard';
import { WebsiteGroup } from '../../components/Dashboard/WebsitesGroups/WebsiteGroup';
import { Link } from 'react-router-dom';
import { saveFile } from '../../utils/file';

export const WebsitesGroups = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    getAllWebsitesGroups().then((data) => setGroups(data));
  }, []);

  const onDelete = (groupId) => {
    setGroups(groups.filter((g) => g.id !== groupId));
  };

  const handleExport = () => {
    downloadUserSessions().then((blob) => {
      saveFile('usuarios.csv', blob);
    });
  };

  const handleExportSamples = () => {
    downloadWebsiteSamples().then((blob) => {
      saveFile('muestras.csv', blob);
    });
  };

  return (
    <div className="w-1/2 mx-auto p-8">
      <h1 className="text-center text-3xl font-bold">Grupos</h1>
      <div className="my-4">
        <Link className="underline text-blue-600" to="/dashboard/groups/new">
          Crear Variante
        </Link>
        <Link className="underline text-blue-600 mx-4" to="/dashboard/websites">
          Sitios
        </Link>
        <button className="underline text-blue-600 mx-4" onClick={handleExport}>
          Exportar usuarios
        </button>
        <button
          className="underline text-blue-600"
          type="button"
          onClick={handleExportSamples}
        >
          Exportar muestras
        </button>
      </div>
      <div className="my-4">
        {groups.map((group) => (
          <WebsiteGroup key={group.id} group={group} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
};
