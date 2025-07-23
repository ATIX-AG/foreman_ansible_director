import React, { JSX } from 'react';
import { WrappedAnsibleContentPage } from '../components/ansible_content';
import { WrappedAnsibleExecutionEnvPage } from '../components/ansible_execution_environments';
import { WrappedAnsibleEnvironmentsPage } from '../components/ansible_environments';

interface RouteConfig {
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (props: any) => JSX.Element;
  exact?: boolean;
}

const routes: RouteConfig[] = [
  {
    path: '/ansible/content/',
    render: props => <WrappedAnsibleContentPage {...props} />,
    exact: true,
  },
  {
    path: '/ansible/execution_environments/',
    render: props => <WrappedAnsibleExecutionEnvPage {...props} />,
    exact: true,
  },
  {
    path: '/ansible/environments/',
    render: props => <WrappedAnsibleEnvironmentsPage {...props} />,
    exact: true,
  },
];

export default routes;
