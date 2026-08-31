import React, { ReactElement } from 'react';
import { Table, TableText, Tbody, Td, Th, Thead, ThProps, Tr } from '@patternfly/react-table';
import {
  Button,
  Label,

} from '@patternfly/react-core';
import { sprintf as __, translate as _ } from 'foremanReact/common/I18n';
import {
  AnsibleVariable,
  BoundAnsibleVariable,
} from '../../../../../../types/AnsibleVariableTypes';
import { dataTypeDisplayNameMap } from '../utils';
import {
  ContentResolutionNode,

} from '../../../../../../types/AnsibleContentAssignmentTypes';
import { crColorHierarchy, crnTypeUiString } from '../../../helpers';
import { VariablesTableToolbar } from './VariablesTableToolbar';
import { InlineValueRenderer } from './InlineValueRenderer';
import { hierarchyIconMap } from '../../../AnsibleContentAssignment';

interface VariablesTableProps {
  variables: BoundAnsibleVariable[];
  resolutionHierarchy: ContentResolutionNode[];
  onItemClick: (variable: BoundAnsibleVariable) => void;
}

type sortableKeys = 'variableName' | 'dataType';
type sortDirection = 'asc' | 'desc';

const indexMap: Record<sortableKeys, number> = {
  variableName: 0,
  dataType: 1,
};

export const VariablesTable = ({ variables, resolutionHierarchy, onItemClick }: VariablesTableProps): ReactElement => {

  const [variableFilter, setVariableFilter] = React.useState<string>('');

  const [activeSortKey, setActiveSortKey] = React.useState<sortableKeys>('variableName');
  const [activeSortDirection, setActiveSortDirection] = React.useState<sortDirection | undefined>('asc');

  const columnNames = {
    variableName: 'Variable name',
    dataType: 'Variable data type',
    resolverStatus: 'Effective value source',
    value: 'Variable value',
  };

  const sortPredicate = (
    sortKey: sortableKeys,
    direction?: sortDirection
  ): ((
    a: AnsibleVariable,
    b: AnsibleVariable
  ) => number) => {
    switch (sortKey) {
      case 'variableName':
        if (direction === 'desc') {
          return (a, b) => a.name.localeCompare(b.name);
        }
        return (a, b) => b.name.localeCompare(a.name);
      case 'dataType':
        if (direction === 'desc') {
          return (a, b) => {
            return a.data_type.localeCompare(b.data_type);
          };
        }
        return (a, b) => {
          return b.data_type.localeCompare(a.data_type);
        };
      default:
        if (direction === 'desc') {
          return (a, b) => a.name.localeCompare(b.name);
        }
        return (a, b) => b.name.localeCompare(a.name);
    }
  };

  const getSortParams = (
    columnKey: sortableKeys
  ): ThProps['sort'] => ({
    sortBy: {
      index: indexMap[activeSortKey],
      direction: activeSortDirection,
      defaultDirection: 'asc',
    },
    onSort: (_event, _index, direction) => {
      setActiveSortKey(columnKey);
      setActiveSortDirection(direction);
    },
    columnIndex: indexMap[columnKey],
  });

  let sortedVariables = variables.filter(v => v.name.includes(variableFilter));
  if (activeSortKey !== undefined) {
    sortedVariables = sortedVariables.sort((a, b) => sortPredicate(activeSortKey, activeSortDirection)(a, b));
  }

  return (
    <>
      <VariablesTableToolbar
        variableFilter={variableFilter}
        onVariableFilter={filterString => setVariableFilter(filterString)}
      />
      <Table aria-label="Simple table">
        <Thead>
          <Tr>
            <Th sort={getSortParams('variableName')}>{columnNames.variableName}</Th>
            <Th>{columnNames.value}</Th>
            <Th sort={getSortParams('dataType')}>{columnNames.dataType}</Th>
            <Th>{columnNames.resolverStatus}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedVariables.map(variable => (
            <Tr
              key={variable.name}
            >
              <Td dataLabel={columnNames.variableName}>
                {variable.name}
              </Td>
              <Td dataLabel={columnNames.value}>
                <InlineValueRenderer item={variable.binding !== null ? variable.binding : variable} />
              </Td>
              <Td dataLabel={columnNames.dataType}>{<Label>{dataTypeDisplayNameMap[variable.data_type]}</Label>}</Td>
              <Td dataLabel={columnNames.resolverStatus}>
                {
                  variable.binding ? (
                    <>
                      <Label color={'green'}>{'Binding'}</Label>
                      {' '}
                      <Label
                        icon={hierarchyIconMap[variable.binding.consumable_type]}
                        color={
                          crColorHierarchy[resolutionHierarchy.findIndex(
                            v => v.type === variable.binding?.consumable_type &&
                            v.id === variable.binding?.consumable_id
                          ) % crColorHierarchy.length]
                        }
                      >
                        {resolutionHierarchy.findIndex(
                          v => v.type === variable.binding?.consumable_type &&
                            v.id === variable.binding?.consumable_id
                        ) === resolutionHierarchy.length - 1
                          ? __(_('This %(crnType)s'), { crnType: crnTypeUiString[variable.binding.consumable_type] })
                          : variable.binding.consumable_name}
                      </Label>
                    </>
                  ) : <Label>{'Default value'}</Label>
                }
              </Td>
              <Td>
                <TableText>
                  <Button variant="secondary" onClick={() => onItemClick(variable)}>Manage</Button>
                </TableText>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};
