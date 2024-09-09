import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EditWebsiteGroupForm } from '../../components/Dashboard/WebsitesGroups/EditWebsiteGroupForm';
import { getWebsiteGroupById } from '../../services/dashboard';

export const EditWebsiteGroup = () => {
  const [group, setGroup] = useState(null);

  const { groupId } = useParams();

  useEffect(() => {
    getWebsiteGroupById(groupId).then((data) => setGroup(data));
  }, []);

  if (group === null) {
    return <p>Cargando grupo</p>;
  }

  return <EditWebsiteGroupForm website_group={group} />;
};
