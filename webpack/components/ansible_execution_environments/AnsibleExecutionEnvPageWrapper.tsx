import React from 'react';
import Permitted from 'foremanReact/components/Permitted';
import AnsibleExecutionEnvPage from './AnsibleExecutionEnvPage';
import { AdPermissions } from '../../constants/foremanAnsibleDirectorPermissions';
import { ForceTaxonomy } from '../common/ForceTaxonomy';

const AnsibleExecutionEnvPageWrapper: React.FC = () => (
  <Permitted requiredPermissions={[AdPermissions.executionEnvironments.view]}>
    <ForceTaxonomy organization>
      <AnsibleExecutionEnvPage />
    </ForceTaxonomy>
  </Permitted>
);

export default AnsibleExecutionEnvPageWrapper;
