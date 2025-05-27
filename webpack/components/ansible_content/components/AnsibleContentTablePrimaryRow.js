import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Td, Tr } from '@patternfly/react-table';
const AnsibleContentTablePrimaryRow = ({ node, setExpandedNodeNames, isExpanded, isDetailsExpanded, setExpandedDetailsNodeNames, posInset, identifier, }) => {
    const treeRow = {
        onCollapse: () => setExpandedNodeNames(prevExpanded => {
            const otherExpandedNodeNames = prevExpanded.filter(name => name !== node.name);
            return isExpanded
                ? otherExpandedNodeNames
                : [...otherExpandedNodeNames, node.name];
        }),
        onToggleRowDetails: () => setExpandedDetailsNodeNames(prevDetailsExpanded => {
            const otherDetailsExpandedNodeNames = prevDetailsExpanded.filter(name => name !== node.name);
            return isDetailsExpanded
                ? otherDetailsExpandedNodeNames
                : [...otherDetailsExpandedNodeNames, node.name];
        }),
        props: {
            isExpanded,
            isDetailsExpanded,
            'aria-level': 1,
            'aria-posinset': posInset,
            'aria-setsize': node.versions ? node.versions.length : 0,
        },
    };
    return (_jsxs(Tr, { children: [_jsx(Td, { dataLabel: "Identifier", treeRow: treeRow, children: identifier }), _jsx(Td, { dataLabel: "Name", children: node.name }), _jsx(Td, { dataLabel: "Namespace", children: node.namespace })] }));
};
export default AnsibleContentTablePrimaryRow;
