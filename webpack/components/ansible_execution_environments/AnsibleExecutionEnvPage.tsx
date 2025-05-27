import React from 'react';
import TableIndexPage from 'foremanReact/components/PF4/TableIndexPage/TableIndexPage';
import ExecutionEnvGridWrapper from './components/ExecutionEnvGridWrapper';

const AnsibleExecutionEnvPage: React.FC = () => (
  <TableIndexPage
    apiUrl="/api/v2/version"
    header="Execution environments"
    apiOptions={{ key: 'ANSIBLE_EXECUTION_ENV_API_REQUEST_KEY' }}
    hasHelpPage
    creatable={false}
    columns={{}}
  >
    <ExecutionEnvGridWrapper />
  </TableIndexPage>
);

export default AnsibleExecutionEnvPage;
