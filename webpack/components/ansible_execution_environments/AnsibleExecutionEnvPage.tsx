import React from 'react';
import ExecutionEnvGridWrapper from './components/ExecutionEnvGridWrapper';
import { Page } from '../common/Page';

const AnsibleExecutionEnvPage: React.FC = () => (
  <Page
    header="Execution environments"
    hasDocumentation={false}
    customToolbarItems={[]}
  >
    <ExecutionEnvGridWrapper />
  </Page>
);

export default AnsibleExecutionEnvPage;
