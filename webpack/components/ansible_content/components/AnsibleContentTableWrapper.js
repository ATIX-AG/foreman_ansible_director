import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { foremanUrl } from 'foremanReact/common/helpers';
import EmptyPage from 'foremanReact/routes/common/EmptyPage';
import { useSetParamsAndApiAndSearch, useTableIndexAPIResponse, } from 'foremanReact/components/PF4/TableIndexPage/Table/TableIndexHooks';
import { useForemanOrganization } from "foremanReact/Root/Context/ForemanContext";
import { AnsibleContentTable } from './AnsibleContentTable';
import AnsibleContentWizard from './AnsibleContentWizard/AnsibleContentWizard';
const AnsibleContentTableWrapper = () => {
    const organization = useForemanOrganization();
    const contentRequest = useTableIndexAPIResponse({
        apiUrl: foremanUrl(`/api/v2/pulsible/ansible_content${organization ? `?organization_id=${organization.id}&` : ''}`),
    });
    const { setParamsAndAPI, params } = useSetParamsAndApiAndSearch({
        defaultParams: { search: '' },
        setAPIOptions: contentRequest.setAPIOptions,
    });
    const onPagination = (newPagination) => {
        setParamsAndAPI({ ...params, ...newPagination });
    };
    if (contentRequest.status === 'RESOLVED') {
        return (_jsxs(_Fragment, { children: [_jsx(AnsibleContentTable, { apiResponse: contentRequest.response, setAPIOptions: contentRequest.setAPIOptions, onPagination: onPagination }), _jsx(AnsibleContentWizard, {})] }));
    }
    else if (contentRequest.status === 'ERROR') {
        return null; // TODO: Handle request error
    }
    return (_jsx(EmptyPage, { message: { type: 'loading', text: 'The impostor is sus' } }));
};
export default AnsibleContentTableWrapper;
