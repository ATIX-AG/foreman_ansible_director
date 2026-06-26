import React from 'react';
import { AdPermissions } from '../../constants/foremanAnsibleDirectorPermissions';
import AnsibleContentPage from './AnsibleContentPage';
import { ForceTaxonomy } from '../common/ForceTaxonomy';
import { Permitted } from '../common/Permitted';

const AnsibleContentPageWrapper: React.FC = () => (
  <Permitted requiredPermissions={[AdPermissions.ansibleContent.view]}>
    <ForceTaxonomy organization>
      <AnsibleContentPage />
    </ForceTaxonomy>
  </Permitted>
);

export default AnsibleContentPageWrapper;
