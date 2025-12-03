import React from 'react';
import Permitted from 'foremanReact/components/Permitted';

import AnsibleEnvironmentsPage from './AnsibleEnvironmentsPage';
import { AdPermissions } from '../../constants/foremanAnsibleDirectorPermissions';

const AnsibleEnvironmentsPageWrapper: React.FC = () => (
  <Permitted requiredPermissions={[AdPermissions.ansibleLcePaths.view]}>
    <AnsibleEnvironmentsPage />
  </Permitted>
);

export default AnsibleEnvironmentsPageWrapper;
