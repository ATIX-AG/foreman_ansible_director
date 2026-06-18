import React from 'react';
import { Permitted } from '../common/Permitted';

import AnsibleEnvironmentsPage from './AnsibleEnvironmentsPage';
import { AdPermissions } from '../../constants/foremanAnsibleDirectorPermissions';
import { ForceTaxonomy } from '../common/ForceTaxonomy';

const AnsibleEnvironmentsPageWrapper: React.FC = () => (
  <Permitted requiredPermissions={[AdPermissions.ansibleLcePaths.view]}>
    <ForceTaxonomy organization>
      <AnsibleEnvironmentsPage />
    </ForceTaxonomy>
  </Permitted>
);

export default AnsibleEnvironmentsPageWrapper;
