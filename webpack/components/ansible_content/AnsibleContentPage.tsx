import React from 'react';
import { Button } from '@patternfly/react-core';
import TableIndexPage from 'foremanReact/components/PF4/TableIndexPage/TableIndexPage';
import AnsibleContentTableWrapper from './components/AnsibleContentTableWrapper';

const AnsibleContentPage: React.FC = () => {
  const [isContentWizardOpen, setIsContentWizardOpen] = React.useState<boolean>(
    false
  );

  return (
    <TableIndexPage
      apiUrl="/api/v2/version"
      header="Ansible Content"
      apiOptions={{ key: 'ANSIBLE_CONTENT_API_REQUEST_KEY' }}
      hasHelpPage
      creatable={false}
      columns={{}}
      customToolbarItems={[
        <Button onClick={() => setIsContentWizardOpen(true)}>
          Import Ansible content
        </Button>,
      ]}
    >
      <AnsibleContentTableWrapper
        isContentWizardOpen={isContentWizardOpen}
        setIsContentWizardOpen={setIsContentWizardOpen}
      />
    </TableIndexPage>
  );
};

export default AnsibleContentPage;
