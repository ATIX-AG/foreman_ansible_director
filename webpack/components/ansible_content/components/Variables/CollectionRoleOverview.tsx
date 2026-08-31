import React, { ReactElement } from 'react';
import {
  Bullseye,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Grid,
  GridItem,
  SearchInput,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { InnerScrollContainer, OuterScrollContainer, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import DatabaseIcon from '@patternfly/react-icons/dist/esm/icons/database-icon';
import { translate as _ } from 'foremanReact/common/I18n';
import { AnsibleCollectionRoleWithVarCount } from '../../../../types/AnsibleContentTypes';
import { VariableListWrapper } from './VariableListWrapper';

interface CollectionRoleOverviewProps {
  collectionName: string;
  collectionNamespace: string;
  collectionRoles: AnsibleCollectionRoleWithVarCount[];
}

export const CollectionRoleOverview = ({
  collectionName,
  collectionNamespace,
  collectionRoles,
}: CollectionRoleOverviewProps): ReactElement => {
  const [selectedRole, setSelectedRole] = React.useState<{ id: number; roleName: string } | null>(null);

  const [roleNameFilter, setRoleNameFilter] = React.useState<string>('');

  return (
    <Grid hasGutter>
      <GridItem span={3}>
        <Stack>
          <StackItem>
            <SearchInput
              placeholder="Find by name"
              value={roleNameFilter}
              onChange={(_event, value) => {
                setRoleNameFilter(value);
              }}
              onClear={() => setRoleNameFilter('')}
            />
          </StackItem>
          <StackItem>
            <div style={{ height: '70vh' }}>
              <OuterScrollContainer>
                <InnerScrollContainer>
                  <Table variant="compact" isStickyHeader>
                    <Thead>
                      <Tr>
                        <Th modifier="nowrap" width={30}>
                          {_('Role')}
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {collectionRoles
                        .filter(role =>
                          role.name.startsWith(roleNameFilter.toLowerCase()))
                        .map(role => (
                          <Tr
                            key={role.name}
                            onRowClick={() => {
                              setSelectedRole({ id: role.id, roleName: role.name });
                            }}
                            isSelectable
                            isClickable
                            isRowSelected={selectedRole?.id === role.id}
                          >
                            <Td dataLabel={_('Role')} modifier="breakWord">
                              {role.name}
                            </Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </InnerScrollContainer>
              </OuterScrollContainer>
            </div>
          </StackItem>
        </Stack>
      </GridItem>
      <GridItem span={9}>
        {selectedRole === null ? (
          <Bullseye>
            <EmptyState style={{ height: '70vh' }}>
              <EmptyStateHeader
                titleText={_('Select a role to see its variables')}
                headingLevel="h4"
                icon={<EmptyStateIcon icon={DatabaseIcon} />}
              />
            </EmptyState>
          </Bullseye>
        ) : (
          <VariableListWrapper
            roleId={selectedRole.id}
            assignable={{
              assignable_name: collectionName,
              assignable_namespace: collectionNamespace,
              assignable_type: 'ForemanAnsibleDirector::AnsibleCollectionRole',
              assignable_role_name: selectedRole.roleName,
            }}
          />
        )}
      </GridItem>
    </Grid>
  );
};
