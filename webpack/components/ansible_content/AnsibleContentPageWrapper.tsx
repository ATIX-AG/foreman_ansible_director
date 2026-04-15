import React from 'react';
import Permitted from 'foremanReact/components/Permitted';
import { AdPermissions } from '../../constants/foremanAnsibleDirectorPermissions';
import AnsibleContentPage from './AnsibleContentPage';
import { ForceTaxonomy } from '../common/ForceTaxonomy';

// TODO: This wrapper will be used for permission management
const AnsibleContentPageWrapper: React.FC = () => (
  <Permitted requiredPermissions={[AdPermissions.ansibleContent.view]}>
    <ForceTaxonomy organization>
      <AnsibleContentPage />
    </ForceTaxonomy>
  </Permitted>
);

export default AnsibleContentPageWrapper;
