import React from 'react';
import { Button } from '@patternfly/react-core';
import { usePermissions } from 'foremanReact/common/hooks/Permissions/permissionHooks';
import AnsibleContentTableWrapper from './components/AnsibleContentTableWrapper';
import { Page } from '../common/Page';
import { AdPermissions } from '../../constants/foremanAnsibleDirectorPermissions';

const AnsibleContentPage: React.FC = () => {
  const [isContentWizardOpen, setIsContentWizardOpen] = React.useState<boolean>(
    false
  );

  const userCanCreateContent: boolean = usePermissions([
    AdPermissions.ansibleContent.create,
  ]);

  return (
    <Page
      header="Ansible Content"
      customToolbarItems={[
        <Button
          onClick={() => setIsContentWizardOpen(true)}
          isDisabled={!userCanCreateContent}
        >
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
