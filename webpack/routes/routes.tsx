import React, { ReactElement } from 'react';
import AnsibleContentPageWrapper from '../components/ansible_content/AnsibleContentPageWrapper';
import AnsibleExecutionEnvPageWrapper from '../components/ansible_execution_environments/AnsibleExecutionEnvPageWrapper';
import AnsibleEnvironmentsPageWrapper from '../components/ansible_environments/AnsibleEnvironmentsPageWrapper';

interface RouteConfig {
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (props: any) => ReactElement;
  exact?: boolean;
}

const routes: RouteConfig[] = [
  {
    path: '/ansible/content/',
    render: props => <AnsibleContentPageWrapper {...props} />,
    exact: true,
  },
  {
    path: '/ansible/execution_environments/',
    render: props => <AnsibleExecutionEnvPageWrapper {...props} />,
    exact: true,
  },
  {
    path: '/ansible/environments/',
    render: props => <AnsibleEnvironmentsPageWrapper {...props} />,
    exact: true,
  },
];

export default routes;
