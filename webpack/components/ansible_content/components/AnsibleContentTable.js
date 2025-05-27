import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Table, Thead, Th, Tbody, Tr } from '@patternfly/react-table';
import Pagination from 'foremanReact/components/Pagination';
import AnsibleContentTablePrimaryRow from './AnsibleContentTablePrimaryRow';
import AnsibleContentTableSecondaryRow from './AnsibleContentTableSecondaryRow';
export const AnsibleContentTable = ({ apiResponse, setAPIOptions, onPagination, }) => {
    const [expandedNodeNames, setExpandedNodeNames] = React.useState([]);
    const [expandedDetailsNodeNames, setExpandedDetailsNodeNames,] = React.useState([]);
    const renderRows = (results) => {
        const rows = [];
        let posInset = 0;
        results.forEach(result => {
            const identifier = `${result.namespace}.${result.name}`;
            const isExpanded = expandedNodeNames.includes(result.name);
            rows.push(_jsx(AnsibleContentTablePrimaryRow, { node: result, setExpandedNodeNames: setExpandedNodeNames, setExpandedDetailsNodeNames: setExpandedDetailsNodeNames, isExpanded: isExpanded, isDetailsExpanded: expandedDetailsNodeNames.includes(result.name), posInset: posInset, identifier: identifier }, identifier), _jsx(AnsibleContentTableSecondaryRow, { identifier: identifier, nodeVersions: result.versions, isExpanded: isExpanded }));
            posInset++;
        });
        return rows;
    };
    return (_jsxs(_Fragment, { children: [_jsxs(Table, { "aria-label": "Simple table", isTreeTable: true, variant: "compact", children: [_jsx(Thead, { children: _jsxs(Tr, { children: [_jsx(Th, { children: "Identifier" }), _jsx(Th, { children: "Name" }), _jsx(Th, { children: "Namespace" })] }) }), _jsx(Tbody, { children: renderRows(apiResponse.results) })] }), _jsx(Pagination, { itemCount: apiResponse.total, onChange: onPagination })] }));
};
