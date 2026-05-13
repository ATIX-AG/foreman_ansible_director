import React, { ReactElement, ReactNode } from 'react';
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  OuterScrollContainer,
  InnerScrollContainer,
  ThProps,
  IAction,
  ActionsColumn,
} from '@patternfly/react-table';

import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';

import { Icon, Label, Popover } from '@patternfly/react-core';
import CubesIcon from '@patternfly/react-icons/dist/esm/icons/cubes-icon';
import CubeIcon from '@patternfly/react-icons/dist/esm/icons/cube-icon';
import {
  AnsibleContentAssignment,
  ContentResolutionNode,
  ContentResolutionNodeType,
  ResolvedAssignment,
} from '../../../../types/AnsibleContentAssignmentTypes';

import { assignmentFqrn, crColorHierarchy, crnTypeUiString } from '../helpers';

interface ContentAssignmentTableProps {
  crnType: ContentResolutionNodeType;
  crnId: number;
  assignments: Array<ResolvedAssignment<AnsibleContentAssignment>>;
  hierarchy: ContentResolutionNode[];
  hierarchyIconMap: Record<ContentResolutionNodeType, ReactElement>;
  onBadAssignmentClick: (
    assignment: ResolvedAssignment<AnsibleContentAssignment>
  ) => void;
  onAssignmentRemove: (
    assignment: ResolvedAssignment<AnsibleContentAssignment>
  ) => void;
}

const indexMap = {
  type: 0,
  fqrn: 1,
  assigned_to: 2,
};

export const ContentAssignmentTable = ({
  crnType,
  crnId,
  assignments,
  hierarchy,
  hierarchyIconMap,
  onBadAssignmentClick,
  onAssignmentRemove,
}: ContentAssignmentTableProps): ReactElement => {
  const [activeSortKey, setActiveSortKey] = React.useState<
    'type' | 'fqrn' | 'assigned_to'
  >('fqrn');

  const [activeSortDirection, setActiveSortDirection] = React.useState<
    'asc' | 'desc' | undefined
  >('desc');

  const sortPredicate = (
    sortKey: 'type' | 'fqrn' | 'assigned_to',
    direction?: 'desc' | 'asc'
  ): ((
    a: ResolvedAssignment<AnsibleContentAssignment>,
    b: ResolvedAssignment<AnsibleContentAssignment>
  ) => number) => {
    switch (sortKey) {
      case 'type':
        if (direction === 'desc') {
          return (a, b) => a.assignable_type.localeCompare(b.assignable_type);
        }
        return (a, b) => b.assignable_type.localeCompare(a.assignable_type);
      case 'fqrn':
        if (direction === 'desc') {
          return (a, b) => {
            const firstFqrn = assignmentFqrn(a);
            const secondFqrn = assignmentFqrn(b);
            return firstFqrn.localeCompare(secondFqrn);
          };
        }
        return (a, b) => {
          const firstFqrn = assignmentFqrn(a);
          const secondFqrn = assignmentFqrn(b);
          return secondFqrn.localeCompare(firstFqrn);
        };
      case 'assigned_to':
        if (direction === 'desc') {
          return (a, b) => {
            const firstHieraNode = hierarchy.find(
              n => n.type === a.consumable_type && n.id === a.consumable_id
            );
            const secondHieraNode = hierarchy.find(
              n => n.type === b.consumable_type && n.id === b.consumable_id
            );
            return firstHieraNode && secondHieraNode
              ? firstHieraNode.name.localeCompare(secondHieraNode.name)
              : 0;
          };
        }
        return (a, b) => {
          const firstHieraNode = hierarchy.find(
            n => n.type === a.consumable_type && n.id === a.consumable_id
          );
          const secondHieraNode = hierarchy.find(
            n => n.type === b.consumable_type && n.id === b.consumable_id
          );
          return firstHieraNode && secondHieraNode
            ? secondHieraNode.name.localeCompare(firstHieraNode.name)
            : 0;
        };
      default:
        return (a, b) => {
          const firstFqrn = assignmentFqrn(a);
          const secondFqrn = assignmentFqrn(b);
          return firstFqrn.localeCompare(secondFqrn);
        };
    }
  };

  let sortedAssignments = assignments;
  if (activeSortKey !== undefined) {
    sortedAssignments = assignments.sort((a, b) =>
      sortPredicate(activeSortKey, activeSortDirection)(a, b)
    );
  }

  const getSortParams = (
    columnKey: keyof typeof indexMap
  ): ThProps['sort'] => ({
    sortBy: {
      index: indexMap[activeSortKey],
      direction: activeSortDirection,
      defaultDirection: 'desc',
    },
    onSort: (_event, _index, direction) => {
      setActiveSortKey(columnKey);
      setActiveSortDirection(direction);
    },
    columnIndex: indexMap[columnKey],
  });

  const hierarchyNode = (
    assignment: ResolvedAssignment<AnsibleContentAssignment>
  ): ReactNode => {
    const node = hierarchy.find(
      n =>
        n.type === assignment.consumable_type &&
        n.id === assignment.consumable_id
    );

    if (node === undefined) {
      return null;
    }

    return (
      <Label
        icon={hierarchyIconMap[node.type]}
        color={
          crColorHierarchy[hierarchy.indexOf(node) % crColorHierarchy.length]
        }
      >
        {hierarchy.indexOf(node) === hierarchy.length - 1 // indexOf(target) is always the last
          ? __(_('This %(crnType)s'), { crnType: crnTypeUiString[crnType] })
          : node.name}
      </Label>
    );
  };

  const columnNames = {
    type: _('Type'),
    fqrn: _('Name'),
    assigned_to: _('Assigned to'),
    resolved: _('Resolved version'),
  };

  const rowActions = (
    assignment: ResolvedAssignment<AnsibleContentAssignment>
  ): IAction[] => [
    { title: _('Unassign'), onClick: () => onAssignmentRemove(assignment) },
  ];

  return (
    <div style={{ height: '50vh' }}>
      <OuterScrollContainer>
        <InnerScrollContainer>
          <Table
            aria-label={_('Assignment Table')}
            ouiaId="AssignmentTable"
            isStickyHeader
          >
            <Thead>
              <Tr>
                <Th sort={getSortParams('type')} modifier="fitContent">
                  {columnNames.type}
                </Th>
                <Th
                  sort={getSortParams('fqrn')}
                  info={{
                    popover: (
                      <div>
                        {_(
                          'The fully qualified role name consists of the $namespace and $name of an Ansible role/collection. When referring to a role in a collection, $role_name is also used. $namespace.$name[.$role_name]'
                        )}
                      </div>
                    ),
                    ariaLabel: 'More information on fqrn',
                    popoverProps: {
                      headerContent: _('Fully qualified role name.'),
                    },
                  }}
                >
                  {columnNames.fqrn}
                </Th>
                <Th sort={getSortParams('assigned_to')}>
                  {columnNames.assigned_to}
                </Th>
                <Th>{columnNames.resolved}</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {sortedAssignments.map((assignment, rowIndex) => (
                <Tr key={rowIndex}>
                  <Td dataLabel={columnNames.type}>
                    <Icon>
                      {assignment.assignable_type ===
                      'ForemanAnsibleDirector::AnsibleRole' ? (
                        <Popover bodyContent={_('Role')} triggerAction="hover">
                          <CubeIcon />
                        </Popover>
                      ) : (
                        <Popover
                          bodyContent={_('Collection')}
                          triggerAction="hover"
                        >
                          <CubesIcon />
                        </Popover>
                      )}
                    </Icon>
                  </Td>
                  <Td dataLabel={columnNames.fqrn}>
                    {assignmentFqrn(assignment)}
                  </Td>
                  <Td dataLabel={columnNames.assigned_to}>
                    {hierarchyNode(assignment)}
                  </Td>
                  <Td dataLabel={columnNames.resolved}>
                    {assignment.resolved !== null ? (
                      <Label color="green">{assignment.resolved.version}</Label>
                    ) : (
                      <Label
                        color="orange"
                        onClick={() => onBadAssignmentClick(assignment)}
                      >
                        {_('No candidate')}
                      </Label>
                    )}
                  </Td>
                  <Td isActionCell>
                    <ActionsColumn
                      items={rowActions(assignment)}
                      isDisabled={
                        !(
                          assignment.consumable_type === crnType &&
                          assignment.consumable_id === crnId
                        )
                      }
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </InnerScrollContainer>
      </OuterScrollContainer>
    </div>
  );
};
