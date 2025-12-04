/* eslint-disable max-lines */
import React, { Dispatch, ReactElement, SetStateAction } from 'react';
import {
  Bullseye,
  Button,
  DataList,
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DataListWrapModifier,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Grid,
  GridItem,
  Label,
  Panel,
  PanelMain,
  PanelMainBody,
  SearchInput,
  Spinner,
  Stack,
  StackItem,
  Switch,
} from '@patternfly/react-core';
import DatabaseIcon from '@patternfly/react-icons/dist/esm/icons/database-icon';
import ResourcesEmptyIcon from '@patternfly/react-icons/dist/esm/icons/resources-empty-icon';
import PencilAltIcon from '@patternfly/react-icons/dist/esm/icons/pencil-alt-icon';

import axios, { AxiosResponse } from 'axios';
import { foremanUrl } from 'foremanReact/common/helpers';
import { addToast } from 'foremanReact/components/ToastsList';
import Permitted from 'foremanReact/components/Permitted';
import { usePermissions } from 'foremanReact/common/hooks/Permissions/permissionHooks';

import { useDispatch } from 'react-redux';
import { AnsibleRole } from '../../../../types/AnsibleContentTypes';
import { AnsibleVariable } from '../../../../types/AnsibleVariableTypes';
import { AdPermissions } from '../../../../constants/foremanAnsibleDirectorPermissions';

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

  // TODO: Maybe it would be smarter to store the role name of the currently open dropdown item
  // eslint-disable-next-line no-unused-vars
  const [dropdownOpen, setDropdownOpen] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [variableUpdating, setVariableUpdating] = React.useState<string>('');

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
      setVariableUpdating('');
    }
  };

  // TODO: As for the header, this should be a table instead of the useless datalist
  return (
    <Grid hasGutter>
      <GridItem span={4}>
        <Stack>
          <StackItem>
            <SearchInput
              placeholder="Find by name"
              value=""
              onChange={(_event, value) => {}}
              onClear={() => {}}
            />
          </StackItem>
          <StackItem>
            <Panel isScrollable>
              <PanelMain>
                <PanelMainBody>
                  <DataList
                    aria-label="Simple data list example"
                    onSelectDataListItem={(_event, id: string) => {
                      setSelectedRole(id);
                      setAvailableVariables(
                        ansibleRoles.find(role => role.name === id)
                          ?.variables || []
                      );
                    }}
                    selectedDataListItemId={selectedRole}
                    isCompact
                  >
                    {ansibleRoles.map(role => (
                      <DataListItem
                        aria-labelledby="simple-item1"
                        id={role.name}
                      >
                        <DataListItemRow>
                          <DataListItemCells
                            dataListCells={[
                              <DataListCell key="primary content">
                                <span id="simple-item1">{role.name}</span>
                              </DataListCell>,
                            ]}
                          />
                          {/* <DataListAction
                            aria-labelledby="check-action-item1 check-action-action1"
                            id="check-action-action1"
                            aria-label="Actions"
                            isPlainButtonAction
                          >
                            <Dropdown
                              popperProps={{ position: 'right' }}
                              onSelect={() => {}}
                              toggle={(
                                toggleRef: React.Ref<MenuToggleElement>
                              ) => (
                                <MenuToggle
                                  ref={toggleRef}
                                  isExpanded={
                                    dropdownOpen[role.name] !== undefined &&
                                    dropdownOpen[role.name]
                                  }
                                  onClick={() => {
                                    setDropdownOpen(oldDropdownOpen => {
                                      // eslint-disable-next-line standard/computed-property-even-spacing
                                      oldDropdownOpen[
                                        role.name
                                      ] = !oldDropdownOpen[role.name];
                                      return { ...oldDropdownOpen };
                                    });
                                  }}
                                  variant="plain"
                                  aria-label="Data list with checkboxes, actions and additional cells example kebab toggle 1"
                                >
                                  <EllipsisVIcon aria-hidden="true" />
                                </MenuToggle>
                              )}
                              isOpen={
                                dropdownOpen[role.name] !== undefined &&
                                dropdownOpen[role.name]
                              }
                              onOpenChange={(isOpen: boolean) => {
                                setDropdownOpen(oldDropdownOpen => {
                                  // eslint-disable-next-line standard/computed-property-even-spacing
                                  oldDropdownOpen[role.name] = !oldDropdownOpen[
                                    role.name
                                  ];
                                  return { ...oldDropdownOpen };
                                });
                              }}
                            >
                              <DropdownList>
                                <DropdownItem
                                  key="link"
                                  onClick={(event: any) =>
                                    event.preventDefault()
                                  }
                                >
                                  Allow overriding for all variables
                                </DropdownItem>
                              </DropdownList>
                            </Dropdown>
                          </DataListAction> */}
                        </DataListItemRow>
                      </DataListItem>
                    ))}
                  </DataList>
                </PanelMainBody>
              </PanelMain>
            </Panel>
          </StackItem>
        </Stack>
      </GridItem>
      <GridItem span={8}>
        {selectedRole !== '' ? (
          <Stack>
            <StackItem>
              <SearchInput
                placeholder="Find by name"
                value=""
                onChange={(_event, value) => {}}
                onClear={() => {}}
              />
            </StackItem>
            <StackItem>
              {availableVariables.length > 0 ? (
                <Panel isScrollable>
                  <PanelMain>
                    <Permitted
                      requiredPermissions={[
                        AdPermissions.ansibleVariables.view,
                      ]}
                    >
                      <PanelMainBody>
                        <DataList
                          aria-label="Simple data list example"
                          isCompact
                        >
                          {availableVariables.map(variable => (
                            <DataListItem
                              aria-labelledby="simple-item1"
                              id={variable.name}
                            >
                              <DataListItemRow>
                                <DataListItemCells
                                  dataListCells={[
                                    <DataListCell
                                      key={`${variable.name}-name`}
                                      wrapModifier={
                                        DataListWrapModifier.breakWord
                                      }
                                    >
                                      <span id="simple-item1">
                                        {variable.name}
                                      </span>
                                    </DataListCell>,
                                    <DataListCell
                                      key={`${variable.name}-default-value`}
                                      wrapModifier={
                                        DataListWrapModifier.breakWord
                                      }
                                    >
                                      <span id="simple-item1">
                                        {JSON.stringify(variable.default_value)}
                                      </span>
                                    </DataListCell>,
                                    <DataListCell
                                      key={`${variable.name}-type`}
                                      wrapModifier={
                                        DataListWrapModifier.breakWord
                                      }
                                      alignRight
                                      isFilled={false}
                                    >
                                      <span id="simple-item1">
                                        <Label color="blue">
                                          {variable.type}
                                        </Label>
                                      </span>
                                    </DataListCell>,
                                    <DataListCell
                                      key={`${variable.name}-override`}
                                      alignRight
                                      isFilled={false}
                                    >
                                      {variableUpdating === variable.id ? (
                                        <Spinner
                                          size="md"
                                          aria-label="Contents of the medium example"
                                        />
                                      ) : (
                                        <Switch
                                          isChecked={
                                            overridableOverrides[variable.id] ||
                                            variable.overridable
                                          }
                                          onChange={(event, checked) =>
                                            onOverrideToggle(variable, checked)
                                          }
                                          isDisabled={!userCanEditVariables}
                                        />
                                      )}
                                    </DataListCell>,
                                    <DataListAction
                                      aria-labelledby="single-action-item1 single-action-action1"
                                      id="single-action-action1"
                                      aria-label="Actions"
                                      isPlainButtonAction
                                    >
                                      <Button
                                        onClick={() => {
                                          setSelectedVariable(variable);
                                        }}
                                        icon={<PencilAltIcon />}
                                        variant="plain"
                                        key={`${variable.name}-action`}
                                        isDisabled={!userCanEditVariables}
                                      />
                                    </DataListAction>,
                                  ]}
                                />
                              </DataListItemRow>
                            </DataListItem>
                          ))}
                        </DataList>
                      </PanelMainBody>
                    </Permitted>
                  </PanelMain>
                </Panel>
              ) : (
                <Bullseye>
                  <EmptyState>
                    <EmptyStateHeader
                      titleText={`${selectedRole} does not have any variables defined.`}
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
            <EmptyState>
              <EmptyStateHeader
                titleText="Select a role to see its variables"
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
