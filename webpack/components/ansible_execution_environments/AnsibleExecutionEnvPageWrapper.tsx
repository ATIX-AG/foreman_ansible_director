import React from 'react';
import AnsibleExecutionEnvPage from './AnsibleExecutionEnvPage';
import { AdPermissions } from '../../constants/foremanAnsibleDirectorPermissions';
import { ForceTaxonomy } from '../common/ForceTaxonomy';
import { Permitted } from '../common/Permitted';

const AnsibleExecutionEnvPageWrapper: React.FC = () => (
  <Permitted requiredPermissions={[AdPermissions.executionEnvironments.view]}>
    <ForceTaxonomy organization>
      <AnsibleExecutionEnvPage />
    </ForceTaxonomy>
  </Permitted>
);

export default AnsibleExecutionEnvPageWrapper;
