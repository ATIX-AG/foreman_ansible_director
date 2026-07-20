import React, { ReactElement, useMemo } from 'react';
import '@patternfly/react-core/dist/styles/base.css';

import {
  Table,
  Tr,
  Tbody,
  Td,
  TreeRowWrapper,
  TdProps,
  OuterScrollContainer,
  InnerScrollContainer,
} from '@patternfly/react-table';
import { SearchInput, Stack, StackItem } from '@patternfly/react-core';

import CubesIcon from '@patternfly/react-icons/dist/esm/icons/cubes-icon';
import CubeIcon from '@patternfly/react-icons/dist/esm/icons/cube-icon';
import { translate as _ } from 'foremanReact/common/I18n';
import {
  AnsibleCollectionRole,
  FullAnsibleContentUnitAssignment,
} from '../../../../types/AnsibleContentTypes';
import {
  AnsibleCollectionRoleAssignment,
  AnsibleContentAssignment,
  AnsibleContentAssignmentCreate,
  AnsibleRoleAssignment,
} from '../../../../types/AnsibleContentAssignmentTypes';
import { assignmentFqrn } from '../helpers';

interface AssignmentSelectorProps {
  availableContent: FullAnsibleContentUnitAssignment[];
  selected: AnsibleContentAssignmentCreate<AnsibleContentAssignment>[];
  onChange: (
    newAssignables: AnsibleContentAssignmentCreate<AnsibleContentAssignment>[]
  ) => void;
}

export const AssignmentSelector = ({
  availableContent,
  selected,
  onChange,
}: AssignmentSelectorProps): ReactElement => {
  const [expandedNodeIds, setExpandedNodeIds] = React.useState<number[]>([]);
  const [fqrnFilter, setFqrnFilter] = React.useState<string>('');

  const assignableFqrns = useMemo(
    () => selected.map(assignable => assignmentFqrn(assignable)),
    [selected]
  );

  const renderAcuRows = (
    [node, ...remainingNodes]: FullAnsibleContentUnitAssignment[],
    level = 1,
    posinset = 1,
    rowIndex = 0,
    isHidden = false
  ): React.ReactNode[] => {
    if (!node) {
      return [];
    }
    const isExpanded = expandedNodeIds.includes(node.id);
    let isChecked: boolean | null;

    // TODO: Optimization potential
    const fqrns = node.roles.map(r => `${node.identifier}.${r.name}`);

    if (fqrns.every(fqrn => assignableFqrns.includes(fqrn))) {
      isChecked = true;
    } else if (fqrns.some(fqrn => assignableFqrns.includes(fqrn))) {
      isChecked = null;
    } else {
      isChecked = false;
    }
    const icon = node.type === 'collection' ? <CubesIcon /> : <CubeIcon />;

    isHidden = !fqrns.some(fqrn => fqrn.includes(fqrnFilter.toLowerCase()));

    const treeRow: TdProps['treeRow'] = {
      onCollapse: () => {
        if (isExpanded) {
          const filtered = expandedNodeIds.filter(n => n !== node.id);
          setExpandedNodeIds([...filtered]);
        } else {
          setExpandedNodeIds([...expandedNodeIds, node.id]);
        }
      },
      onCheckChange: () => onAcuSelect(isChecked, node),
      rowIndex,
      props: {
        isExpanded,
        isHidden,
        'aria-level': level,
        'aria-posinset': posinset,
        'aria-setsize': node.roles ? node.roles.length : 0,
        isChecked,
        checkboxId: `checkbox_id_${node.identifier
          .toLowerCase()
          .replace(/\s+/g, '_')}`,
        icon,
      },
    };

    const childRows =
      node.roles && node.roles.length
        ? renderAcrRows(
          node.roles,
          node,
          level + 1,
          1,
          rowIndex + 1,
          !isExpanded || isHidden
        )
        : [];

    return [
      <TreeRowWrapper key={node.id} row={{ props: treeRow.props }}>
        <Td treeRow={treeRow}>{node.identifier}</Td>
      </TreeRowWrapper>,
      ...childRows,
      ...renderAcuRows(
        remainingNodes,
        level,
        posinset + 1,
        rowIndex + 1 + childRows.length,
        isHidden
      ),
    ];
  };

  const renderAcrRows = (
    [node, ...remainingNodes]: AnsibleCollectionRole[],
    parent: FullAnsibleContentUnitAssignment,
    level = 1,
    posinset = 1,
    rowIndex = 0,
    isHidden = false
  ): React.ReactNode[] => {
    if (!node) {
      return [];
    }
    const fqrn = `${parent.identifier}.${node.name}`;

    const isChecked = assignableFqrns.filter(n => n === fqrn).length > 0;
    const icon = <CubeIcon />;

    isHidden =
      !fqrn.includes(fqrnFilter.toLowerCase()) ||
      !expandedNodeIds.includes(parent.id);

    const treeRow: TdProps['treeRow'] = {
      onCollapse: () => {},
      onCheckChange: () => onAcrSelect(isChecked, parent, node),
      rowIndex,
      props: {
        'aria-level': level,
        'aria-posinset': posinset,
        'aria-setsize': 0,
        isChecked,
        checkboxId: `checkbox_id_${node.name
          .toLowerCase()
          .replace(/\s+/g, '_')}`,
        icon,
      },
    };

    return [
      <Tr
        key={node.id}
        aria-level={level}
        aria-posinset={posinset}
        isHidden={isHidden}
        isClickable
        onRowClick={() => onAcrSelect(isChecked, parent, node)}
      >
        <Td treeRow={treeRow}>{node.name}</Td>
      </Tr>,
      ...renderAcrRows(
        remainingNodes,
        parent,
        level,
        posinset + 1,
        rowIndex + 1,
        isHidden
      ),
    ];
  };

  const onAcuSelect = (
    isChecked: boolean | null,
    acu: FullAnsibleContentUnitAssignment
  ): void => {
    switch (isChecked) {
      case false:
        {
          let newAssignables;
          if (acu.type === 'collection') {
            const splitIdentifier = acu.identifier.split('.');
            newAssignables = acu.roles.map(
              collectionRole =>
                ({
                  assignable_type:
                    'ForemanAnsibleDirector::AnsibleCollectionRole',
                  assignable_namespace: splitIdentifier[0],
                  assignable_name: splitIdentifier[1],
                  assignable_role_name: collectionRole.name,
                } as AnsibleContentAssignmentCreate<
                  AnsibleCollectionRoleAssignment
                >)
            );
          } else {
            const splitIdentifier = acu.identifier.split('.');
            newAssignables = [
              {
                assignable_type: 'ForemanAnsibleDirector::AnsibleRole',
                assignable_namespace: splitIdentifier[0],
                assignable_name: splitIdentifier[1],
              } as AnsibleContentAssignmentCreate<AnsibleRoleAssignment>,
            ];
          }

          onChange([...selected, ...newAssignables]);
        }
        break;
      default:
        // true || null
        {
          let filterFqrns: string[];

          if (acu.type === 'collection') {
            filterFqrns = acu.roles.map(
              collectionRole => `${acu.identifier}.${collectionRole.name}`
            );
          } else {
            filterFqrns = [acu.identifier];
          }

          onChange([
            ...selected.filter(n => !filterFqrns.includes(assignmentFqrn(n))),
          ]);
        }
        break;
    }
  };

  const onAcrSelect = (
    isChecked: boolean,
    acu: FullAnsibleContentUnitAssignment,
    acr: AnsibleCollectionRole
  ): void => {
    isChecked
      ? onChange([
        ...selected.filter(
          assignable =>
            assignmentFqrn(assignable) !== `${acu.identifier}.${acr.name}`
        ),
      ])
      : onChange([
        ...selected,
        {
          assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
          assignable_namespace: acu.identifier.split('.')[0],
          assignable_name: acu.identifier.split('.')[1],
          assignable_role_name: acr.name,
        } as AnsibleContentAssignmentCreate<AnsibleCollectionRoleAssignment>,
      ]);
  };

  return (
    <div style={{ height: '70vh' }}>
      <Stack hasGutter>
        <StackItem>
          <SearchInput
            style={{ width: '100%' }}
            placeholder={_('Filter by name')}
            value={fqrnFilter}
            onChange={(_event, value) => setFqrnFilter(value)}
          />
        </StackItem>
        <StackItem>
          <OuterScrollContainer>
            <InnerScrollContainer>
              <Table
                isTreeTable
                aria-label={_('Assignments table')}
                variant="compact"
              >
                <Tbody>{renderAcuRows(availableContent)}</Tbody>
              </Table>
            </InnerScrollContainer>
          </OuterScrollContainer>
        </StackItem>
      </Stack>
    </div>
  );
};
