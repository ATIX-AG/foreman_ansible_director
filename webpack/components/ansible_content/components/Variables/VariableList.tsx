import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Label,
  OverflowMenu,
  OverflowMenuContent,
  OverflowMenuGroup,
  OverflowMenuItem,
  SearchInput,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { InnerScrollContainer, OuterScrollContainer, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React, { ReactElement } from 'react';
import { translate as _ } from 'foremanReact/common/I18n';
import ResourcesEmptyIcon from '@patternfly/react-icons/dist/esm/icons/resources-empty-icon';
import { AdPermissions } from '../../../../constants/foremanAnsibleDirectorPermissions';
import { AnsibleVariable } from '../../../../types/AnsibleVariableTypes';
import { Permitted } from '../../../common/Permitted';
import { dataTypeDisplayNameMap } from '../../../common/AnsibleContentAssignment/components/Variables/utils';
import {
  InlineValueRenderer,
} from '../../../common/AnsibleContentAssignment/components/Variables/components/InlineValueRenderer';

interface VariableListProps {
  variables: AnsibleVariable[];
  onManageVariablesClick: (variable: AnsibleVariable) => void;
  onManageBindingsClick: (variable: AnsibleVariable) => void;
}

export const VariableList = ({
  variables,
  onManageVariablesClick,
  onManageBindingsClick,
}: VariableListProps): ReactElement => {

  const [variableFilter, setVariableFilter] = React.useState<string>('');

  return (
    <>
      {variables.length !== 0 ? (
        <Stack>
          <StackItem>
            <SearchInput
              placeholder="Find by name"
              value={variableFilter}
              onChange={(_event, value) => setVariableFilter(value)}
              onClear={() => setVariableFilter('')}
            />
          </StackItem>
          <StackItem>
            <Permitted
              requiredPermissions={[AdPermissions.ansibleVariables.view]}
            >
              <div style={{ height: '70vh' }}>
                <OuterScrollContainer>
                  <InnerScrollContainer>
                    <Table variant="compact" isStickyHeader>
                      <Thead>
                        <Tr>
                          <Th modifier="nowrap" width={30}>
                            {_('Name')}
                          </Th>
                          <Th modifier={'nowrap'}>{_('Variable value')}</Th>
                          <Th modifier="nowrap">{_('Data type')}</Th>
                          <Th modifier="nowrap">{_('Bound by')}</Th>
                          <Th modifier="nowrap" />
                        </Tr>
                      </Thead>
                      <Tbody>
                        {variables
                          .filter(variable =>
                            variable.name.includes(
                              variableFilter.toLowerCase()
                            ))
                          .map(variable => (
                            <Tr key={variable.id}>
                              <Td
                                dataLabel={_('Variable name')}
                                modifier="breakWord"
                              >
                                {variable.name}
                              </Td>
                              <Td
                                dataLabel={_('Variable value')}
                                modifier="nowrap"
                              >
                                <InlineValueRenderer item={variable} />
                              </Td>
                              <Td dataLabel={_('Data type')}>
                                <Label color="blue" isCompact>
                                  {dataTypeDisplayNameMap[variable.data_type]}
                                </Label>
                              </Td>
                              <Td dataLabel={_('Bound by')}>
                                <Label color="blue" isCompact>
                                  {`${variable.bindings_count} bindings`}
                                </Label>
                              </Td>
                              <Td isActionCell>
                                <OverflowMenu breakpoint="lg">
                                  <OverflowMenuContent>
                                    <OverflowMenuGroup groupType="button">
                                      <OverflowMenuItem>
                                        <Button
                                          variant="secondary"
                                          onClick={
                                            () => onManageVariablesClick(variable)
                                          }
                                        >Manage Variable</Button>
                                      </OverflowMenuItem>
                                      <OverflowMenuItem>
                                        <Button
                                          variant="secondary"
                                          onClick={
                                            () => onManageBindingsClick(variable)
                                          }
                                        >Manage Bindings</Button>
                                      </OverflowMenuItem>
                                    </OverflowMenuGroup>
                                  </OverflowMenuContent>
                                </OverflowMenu>
                              </Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  </InnerScrollContainer>
                </OuterScrollContainer>
              </div>
            </Permitted>
          </StackItem>
        </Stack>
      ) : (
        <Bullseye>
          <EmptyState style={{ height: '70vh' }}>
            <EmptyStateHeader
              titleText={
                _('Role does not have any variables defined.')
              }
              headingLevel="h4"
              icon={<EmptyStateIcon icon={ResourcesEmptyIcon} />}
            />
          </EmptyState>
        </Bullseye>
      )}

    </>
  );
};
