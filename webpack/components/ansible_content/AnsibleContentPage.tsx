import React from 'react';
import TableIndexPage from 'foremanReact/components/PF4/TableIndexPage/TableIndexPage';
import AnsibleContentTableWrapper from './components/AnsibleContentTableWrapper';

const AnsibleContentPage: React.FC = () => (
  <TableIndexPage
    apiUrl="/api/v2/version"
    header="SUS"
    apiOptions={{ key: 'ANSIBLE_CONTENT_API_REQUEST_KEY' }}
    hasHelpPage
    creatable={false}
    columns={{}}
  >
    <AnsibleContentTableWrapper />
  </TableIndexPage>
);

export default AnsibleContentPage;
