import React from 'react';
import { AdPermissions } from '../../constants/foremanAnsibleDirectorPermissions';
import AnsibleContentPage from './AnsibleContentPage';
import { ForceTaxonomy } from '../common/ForceTaxonomy';
import { Permitted } from '../common/Permitted';
import { AlertModalProvider } from '../common/Alerts/AlertContext';

const AnsibleContentPageWrapper: React.FC = () => (
  <Permitted requiredPermissions={[AdPermissions.ansibleContent.view]}>
    <AlertModalProvider>
      <ForceTaxonomy organization>
        <AnsibleContentPage />
      </ForceTaxonomy>
    </AlertModalProvider>
  </Permitted>
);

export default AnsibleContentPageWrapper;
