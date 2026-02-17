import React from 'react';

import { translate as _ } from 'foremanReact/common/I18n';

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
      header={_('Ansible content')}
      customToolbarItems={[
        <PermittedButton
          onClick={() => setIsContentWizardOpen(true)}
          requiredPermissions={[AdPermissions.ansibleContent.create]}
        >
          {_('Import Ansible content')}
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
