import React from 'react';
import Permitted from 'foremanReact/components/Permitted';
import { AdPermissions } from '../../constants/foremanAnsibleDirectorPermissions';
import AnsibleContentPage from './AnsibleContentPage';

// TODO: This wrapper will be used for permission management
const AnsibleContentPageWrapper: React.FC = () => (
  <Permitted requiredPermissions={[AdPermissions.ansibleContent.view]}>
    <AnsibleContentPage />
  </Permitted>
);

export default AnsibleContentPageWrapper;
