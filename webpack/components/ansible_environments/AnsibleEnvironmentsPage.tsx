import React, { ReactElement } from 'react';
import { useUrlParams } from 'foremanReact/components/PF4/TableIndexPage/Table/TableHooks';

import AnsibleContentTableWrapper from './components/AnsibleLcePathIndexWrapper';

const AnsibleEnvironmentsPage = (): ReactElement => {
  const { searchParam } = useUrlParams();

  return <AnsibleContentTableWrapper initialSearch={searchParam} />;
};

export default AnsibleEnvironmentsPage;
