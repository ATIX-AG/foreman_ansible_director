import React, { Dispatch } from 'react';
import { Td, Tr } from '@patternfly/react-table';
import { AnsibleContentResult } from './AnsibleContentTableWrapper';

interface AnsibleContentTablePrimaryRowProps {
  node: AnsibleContentResult;
  setExpandedNodeNames: Dispatch<React.SetStateAction<string[]>>;
  isExpanded: boolean;
  isDetailsExpanded: boolean;
  setExpandedDetailsNodeNames: Dispatch<React.SetStateAction<string[]>>;
  posInset: number;
  identifier: string;
}

const AnsibleContentTablePrimaryRow: React.FC<AnsibleContentTablePrimaryRowProps> = ({
  node,
  setExpandedNodeNames,
  isExpanded,
  isDetailsExpanded,
  setExpandedDetailsNodeNames,
  posInset,
  identifier,
}) => {
  const treeRow = {
    onCollapse: () =>
      setExpandedNodeNames(prevExpanded => {
        const otherExpandedNodeNames = prevExpanded.filter(
          name => name !== node.name
        );
        return isExpanded
          ? otherExpandedNodeNames
          : [...otherExpandedNodeNames, node.name];
      }),
    onToggleRowDetails: () =>
      setExpandedDetailsNodeNames(prevDetailsExpanded => {
        const otherDetailsExpandedNodeNames = prevDetailsExpanded.filter(
          name => name !== node.name
        );
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

  return (
    <Tr>
      <Td dataLabel="Identifier" treeRow={treeRow}>
        {identifier}
      </Td>
      <Td dataLabel="Name">{node.name}</Td>
      <Td dataLabel="Namespace">{node.namespace}</Td>
    </Tr>
  );
};

export default AnsibleContentTablePrimaryRow;
