import React from 'react';
import { useUrlParams } from 'foremanReact/components/PF4/TableIndexPage/Table/TableHooks';

import ExecutionEnvGridWrapper from './components/ExecutionEnvGridWrapper';
import { Page } from '../common/Page';

const AnsibleExecutionEnvPage: React.FC = () => {
  const { searchParam } = useUrlParams();
  return (
    <Page
      header="Execution environments"
      hasDocumentation={false}
      customToolbarItems={[]}
    >
      <ExecutionEnvGridWrapper initialSearch={searchParam} />
    </Page>
  );
};

export default AnsibleExecutionEnvPage;
