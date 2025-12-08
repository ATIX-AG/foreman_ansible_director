import React from 'react';
import AnsibleContentTableWrapper from './components/AnsibleContentTableWrapper';
import { Page } from '../common/Page';
import { AdPermissions } from '../../constants/foremanAnsibleDirectorPermissions';
import { PermittedButton } from '../common/PermittedButton';

const AnsibleContentPage: React.FC = () => {
  const [isContentWizardOpen, setIsContentWizardOpen] = React.useState<boolean>(
    false
  );

  return (
    <Page
      header="Ansible Content"
      customToolbarItems={[
        <PermittedButton
          onClick={() => setIsContentWizardOpen(true)}
          requiredPermissions={[AdPermissions.ansibleContent.create]}
        >
          Import Ansible content
        </PermittedButton>,
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
