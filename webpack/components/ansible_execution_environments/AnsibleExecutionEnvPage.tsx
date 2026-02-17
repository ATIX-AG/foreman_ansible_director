import React from 'react';

import { translate as _ } from 'foremanReact/common/I18n';

import ExecutionEnvGridWrapper from './components/ExecutionEnvGridWrapper';
import { Page } from '../common/Page';

const AnsibleExecutionEnvPage: React.FC = () => (
  <Page
    header={_('Ansible Execution Environments')}
    hasDocumentation={false}
    customToolbarItems={[]}
  >
    <ExecutionEnvGridWrapper />
  </Page>
);

export default AnsibleExecutionEnvPage;
