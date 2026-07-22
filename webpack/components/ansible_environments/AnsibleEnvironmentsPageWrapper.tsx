import React from 'react';
import { Permitted } from '../common/Permitted';

import AnsibleEnvironmentsPage from './AnsibleEnvironmentsPage';
import { AdPermissions } from '../../constants/foremanAnsibleDirectorPermissions';
import { ForceTaxonomy } from '../common/ForceTaxonomy';
import { AlertModalProvider } from '../common/Alerts/AlertContext';

const AnsibleEnvironmentsPageWrapper: React.FC = () => (
  <Permitted requiredPermissions={[AdPermissions.ansibleLcePaths.view]}>
    <AlertModalProvider>
      <ForceTaxonomy organization>
        <AnsibleEnvironmentsPage />
      </ForceTaxonomy>
    </AlertModalProvider>
  </Permitted>
);

export default AnsibleEnvironmentsPageWrapper;
