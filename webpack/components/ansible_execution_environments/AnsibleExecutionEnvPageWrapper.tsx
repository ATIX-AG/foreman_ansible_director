import React from 'react';
import AnsibleExecutionEnvPage from './AnsibleExecutionEnvPage';
import { AdPermissions } from '../../constants/foremanAnsibleDirectorPermissions';
import { ForceTaxonomy } from '../common/ForceTaxonomy';
import { Permitted } from '../common/Permitted';
import { AlertModalProvider } from '../common/Alerts/AlertContext';

const AnsibleExecutionEnvPageWrapper: React.FC = () => (
  <Permitted requiredPermissions={[AdPermissions.executionEnvironments.view]}>
    <AlertModalProvider>
      <ForceTaxonomy organization>
        <AnsibleExecutionEnvPage />
      </ForceTaxonomy>
    </AlertModalProvider>
  </Permitted>
);

export default AnsibleExecutionEnvPageWrapper;
