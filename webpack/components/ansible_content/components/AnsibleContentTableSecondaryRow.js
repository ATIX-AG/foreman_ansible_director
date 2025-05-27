import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Table, Thead, Th, Tbody, Tr, Td, ExpandableRowContent, } from '@patternfly/react-table';
const AnsibleContentTableSecondaryRow = ({ identifier, nodeVersions, isExpanded, }) => {
    const versionRows = (versions) => versions.map(version => (_jsx(Tr, { children: _jsx(Td, { dataLabel: "Version", children: version.version }) }, `${identifier}:${version.version}`)));
    return (_jsx(Tr, { isExpanded: isExpanded, children: _jsxs(Td, { colSpan: 3, children: [_jsx(ExpandableRowContent, { children: _jsxs(Table, { "aria-label": "Simple table", variant: "compact", children: [_jsx(Thead, { children: _jsx(Tr, { children: _jsx(Th, { children: "Version" }) }) }), _jsx(Tbody, { children: versionRows(nodeVersions) })] }) }), ' '] }) }));
};
export default AnsibleContentTableSecondaryRow;
