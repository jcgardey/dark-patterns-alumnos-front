import { EditWebsiteGroupForm } from '../../components/Dashboard/WebsitesGroups/EditWebsiteGroupForm';

export const CreateWebsiteGroup = () => {
  const newWebsite = {
    name: '',
    order: '',
    websites: [],
  };

  return <EditWebsiteGroupForm website_group={newWebsite} />;
};
