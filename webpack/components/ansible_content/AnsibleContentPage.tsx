import React from 'react';
import { Button } from '@patternfly/react-core';
import AnsibleContentTableWrapper from './components/AnsibleContentTableWrapper';
import { Page } from '../common/Page';

const AnsibleContentPage: React.FC = () => {
  const [isContentWizardOpen, setIsContentWizardOpen] = React.useState<boolean>(
    false
  );

  return (
    <Page
      header="Ansible Content"
      customToolbarItems={[
        <Button onClick={() => setIsContentWizardOpen(true)}>
          Import Ansible content
        </Button>,
      ]}
      hasDocumentation={false}
    >
      <AnsibleContentTableWrapper
        isContentWizardOpen={isContentWizardOpen}
        setIsContentWizardOpen={setIsContentWizardOpen}
      />
    </Page>
  );
};

export default AnsibleContentPage;
