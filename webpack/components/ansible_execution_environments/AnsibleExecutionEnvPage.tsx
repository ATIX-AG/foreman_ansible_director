import React from 'react';

import { translate as _ } from 'foremanReact/common/I18n';
import { useUrlParams } from 'foremanReact/components/PF4/TableIndexPage/Table/TableHooks';

import ExecutionEnvGridWrapper from './components/ExecutionEnvGridWrapper';
import { Page } from '../common/Page';

const AnsibleExecutionEnvPage: React.FC = () => {
  const { searchParam } = useUrlParams();
  return (
    <ExecutionEnvGridWrapper initialSearch={searchParam} />
  );
};

export default AnsibleExecutionEnvPage;
