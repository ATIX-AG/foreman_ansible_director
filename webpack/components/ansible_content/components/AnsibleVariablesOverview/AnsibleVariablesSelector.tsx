/* eslint-disable max-lines */
import React, { Dispatch, ReactElement, SetStateAction } from 'react';
import {
  Bullseye,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Grid,
  GridItem,
  Label,
  SearchInput,
  Spinner,
  Stack,
  StackItem,
  Switch,
} from '@patternfly/react-core';
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  OuterScrollContainer,
  InnerScrollContainer,
} from '@patternfly/react-table';

import DatabaseIcon from '@patternfly/react-icons/dist/esm/icons/database-icon';
import ResourcesEmptyIcon from '@patternfly/react-icons/dist/esm/icons/resources-empty-icon';
import PencilAltIcon from '@patternfly/react-icons/dist/esm/icons/pencil-alt-icon';

import axios, { AxiosResponse } from 'axios';
import { foremanUrl } from 'foremanReact/common/helpers';
import { addToast } from 'foremanReact/components/ToastsList';
import Permitted from 'foremanReact/components/Permitted';
import { usePermissions } from 'foremanReact/common/hooks/Permissions/permissionHooks';
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';

import { useDispatch } from 'react-redux';
import { AnsibleRole } from '../../../../types/AnsibleContentTypes';
import { AnsibleVariable } from '../../../../types/AnsibleVariableTypes';
import { AdPermissions } from '../../../../constants/foremanAnsibleDirectorPermissions';
import { PermittedButton } from '../../../common/PermittedButton';

interface AnsibleVariablesSelectorProps {
  ansibleRoles: AnsibleRole[];
  setSelectedVariable: Dispatch<SetStateAction<AnsibleVariable | undefined>>;
}

export const AnsibleVariablesSelector = ({
  ansibleRoles,
  setSelectedVariable,
}: AnsibleVariablesSelectorProps): ReactElement => {
  const [selectedRole, setSelectedRole] = React.useState<string>('');
  const [availableVariables, setAvailableVariables] = React.useState<
    AnsibleVariable[]
  >([]);

  const [overridableOverrides, setOverridableOverrides] = React.useState<{
    [key: string]: boolean;
  }>({});

  // This search approach is fine for 50 items, but not 500. For that, we should use a server-side search.
  const [roleFilter, setRoleFilter] = React.useState<string>('');
  const [variableFilter, setVariableFilter] = React.useState<string>('');

  const [variableUpdating, setVariableUpdating] = React.useState<number>(-1);

  const userCanEditVariables: boolean = usePermissions([
    AdPermissions.ansibleVariables.edit,
  ]);

  const dispatch = useDispatch();

  const onOverrideToggle = async (
    variable: AnsibleVariable,
    checked: boolean
  ): Promise<void> => {
    try {
      setVariableUpdating(variable.id);
      await axios.put(
        `${foremanUrl('/api/v2/ansible_director/ansible_variables/')}/${
          variable.id
        }`,
        {
          ansible_variable: {
            key: variable.name,
            type: variable.type,
            default_value: variable.default_value,
            overridable: checked,
          },
        }
      );
      dispatch(
        addToast({
          type: 'success',
          key: `UPDATE_ANSIBLE_VARIABLE_${variable.id}_SUCC`,
          message: `Successfully edited override for "${variable.name}"!`,
          sticky: false,
        })
      );

      setOverridableOverrides(prevState => {
        prevState[variable.id] = checked;
        return { ...prevState };
      });
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: `UPDATE_ANSIBLE_VARIABLE_${variable.id}_ERR`,
          message: `Updating of Ansible variable "${
            variable.name
          }" failed with error code "${
            (e as { response: AxiosResponse }).response.status
          }".`,
          sticky: false,
        })
      );
    } finally {
      setVariableUpdating(-1);
    }
  };

  return (
    <Grid hasGutter>
      <GridItem span={3}>
        <Stack>
          <StackItem>
            <SearchInput
              placeholder={_('Find by name')}
              value={roleFilter}
              onChange={(_event, value) => {
                setRoleFilter(value);
              }}
              onClear={() => setRoleFilter('')}
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
                      {ansibleRoles
                        .filter(role =>
                          role.name.startsWith(roleFilter.toLowerCase())
                        )
                        .map(role => (
                          <Tr
                            key={role.name}
                            onRowClick={() => {
                              setSelectedRole(role.name);
                              setAvailableVariables(
                                ansibleRoles.find(
                                  ansibleRole => ansibleRole.name === role.name
                                )?.variables || []
                              );
                            }}
                            isSelectable
                            isClickable
                            isRowSelected={selectedRole === role.name}
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
        {selectedRole !== '' ? (
          <Stack>
            <StackItem>
              <SearchInput
                placeholder={_('Find by name')}
                value={variableFilter}
                onChange={(_event, value) => setVariableFilter(value)}
                onClear={() => setVariableFilter('')}
              />
            </StackItem>
            <StackItem>
              {availableVariables.length > 0 ? (
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
                              <Th modifier="breakWord">{_('Default value')}</Th>
                              <Th modifier="nowrap">{_('Type')}</Th>
                              <Th modifier="nowrap">{_('Overridable?')}</Th>
                              <Th modifier="nowrap" />
                            </Tr>
                          </Thead>
                          <Tbody>
                            {availableVariables
                              .filter(variable =>
                                variable.name.startsWith(
                                  variableFilter.toLowerCase()
                                )
                              )
                              .map(variable => (
                                <Tr key={variable.id}>
                                  <Td
                                    dataLabel={_('Variable name')}
                                    modifier="breakWord"
                                  >
                                    {variable.name}
                                  </Td>
                                  <Td
                                    dataLabel={_('Default value')}
                                    modifier="breakWord"
                                  >
                                    {JSON.stringify(variable.default_value)}
                                  </Td>
                                  <Td dataLabel={_('Type')}>
                                    <Label color="blue" isCompact>
                                      {variable.type}
                                    </Label>
                                  </Td>
                                  <Td dataLabel={_('Overridable?')}>
                                    {variableUpdating === variable.id ? (
                                      <Spinner
                                        size="md"
                                        aria-label={_('Loading variable state')}
                                      />
                                    ) : (
                                      <Switch
                                        isChecked={
                                          // eslint-disable-next-line standard/computed-property-even-spacing
                                          overridableOverrides[variable.id] ||
                                          variable.overridable
                                        }
                                        onChange={(event, checked) =>
                                          onOverrideToggle(variable, checked)
                                        }
                                        isDisabled={!userCanEditVariables}
                                      />
                                    )}
                                  </Td>
                                  <Td>
                                    <PermittedButton
                                      onClick={() => {
                                        setSelectedVariable(variable);
                                      }}
                                      hasPopover={false}
                                      key={`${variable.name}-action`}
                                      variant="plain"
                                      icon={<PencilAltIcon />}
                                      requiredPermissions={[
                                        AdPermissions.ansibleVariables.edit,
                                        AdPermissions.ansibleVariableOverrides
                                          .view,
                                        AdPermissions.ansibleVariableOverrides
                                          .destroy,
                                        AdPermissions.ansibleVariableOverrides
                                          .edit,
                                      ]}
                                    />
                                  </Td>
                                </Tr>
                              ))}
                          </Tbody>
                        </Table>
                      </InnerScrollContainer>
                    </OuterScrollContainer>
                  </div>
                </Permitted>
              ) : (
                <Bullseye>
                  <EmptyState style={{ height: '70vh' }}>
                    <EmptyStateHeader
                      titleText={__(
                        _('%(role)s does not have any variables defined.'),
                        { role: selectedRole }
                      )}
                      headingLevel="h4"
                      icon={<EmptyStateIcon icon={ResourcesEmptyIcon} />}
                    />
                  </EmptyState>
                </Bullseye>
              )}
            </StackItem>
          </Stack>
        ) : (
          <Bullseye>
            <EmptyState style={{ height: '70vh' }}>
              <EmptyStateHeader
                titleText={_('Select a role to see its variables')}
                headingLevel="h4"
                icon={<EmptyStateIcon icon={DatabaseIcon} />}
              />
            </EmptyState>
          </Bullseye>
        )}
      </GridItem>
    </Grid>
  );
};
