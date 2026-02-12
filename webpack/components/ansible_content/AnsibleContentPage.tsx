import React from 'react';
import { useUrlParams } from 'foremanReact/components/PF4/TableIndexPage/Table/TableHooks';

import AnsibleContentTableWrapper from './components/AnsibleContentTableWrapper';

const AnsibleContentPage: React.FC = () => {
  const { searchParam } = useUrlParams();

  return <AnsibleContentTableWrapper initialSearch={searchParam} />;
};

export default AnsibleContentPage;
