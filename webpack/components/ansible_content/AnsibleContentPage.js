import { jsx as _jsx } from "react/jsx-runtime";
import TableIndexPage from 'foremanReact/components/PF4/TableIndexPage/TableIndexPage';
import AnsibleContentTableWrapper from './components/AnsibleContentTableWrapper';
const AnsibleContentPage = () => (_jsx(TableIndexPage, { apiUrl: "/api/v2/version", header: "SUS", apiOptions: { key: 'ANSIBLE_CONTENT_API_REQUEST_KEY' }, hasHelpPage: true, creatable: false, columns: {}, children: _jsx(AnsibleContentTableWrapper, {}) }));
export default AnsibleContentPage;
