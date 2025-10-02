import React, { Dispatch } from 'react';
import { ActionsColumn, IAction, Td, Tr } from '@patternfly/react-table';
import { AnsibleContentUnit } from '../../../types/AnsibleContentTypes';

interface AnsibleContentTablePrimaryRowProps {
  node: AnsibleContentUnit;
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

  const rowActions: IAction[] = [{ title: 'Action 1', onClick: () => {} }];

  return (
    <Tr>
      <Td dataLabel="Identifier" treeRow={treeRow}>
        {identifier}
      </Td>
      <Td dataLabel="Type">{node.type}</Td>
      <Td dataLabel="Namespace">{node.namespace}</Td>
      <Td dataLabel="Name">{node.name}</Td>
      <Td isActionCell>
        <ActionsColumn items={rowActions} />
      </Td>
    </Tr>
  );
};

export default AnsibleContentTablePrimaryRow;
