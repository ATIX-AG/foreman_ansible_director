import React from 'react';
import Permitted from 'foremanReact/components/Permitted';
import AnsibleExecutionEnvPage from './AnsibleExecutionEnvPage';
import { AdPermissions } from '../../constants/foremanAnsibleDirectorPermissions';

const AnsibleExecutionEnvPageWrapper: React.FC = () => (
  <Permitted requiredPermissions={[AdPermissions.executionEnvironments.view]}>
    <AnsibleExecutionEnvPage />
  </Permitted>
);

export default AnsibleExecutionEnvPageWrapper;
