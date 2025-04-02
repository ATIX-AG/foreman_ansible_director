import React, { JSX } from 'react';
import { WrappedAnsibleContentPage } from '../components/ansible_content';

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
];

export default routes;
