import React, { ReactElement } from 'react';
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
  Panel,
  PanelMain,
  PanelMainBody,
  SearchInput,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import DatabaseIcon from '@patternfly/react-icons/dist/esm/icons/database-icon';
import ResourcesEmptyIcon from '@patternfly/react-icons/dist/esm/icons/resources-empty-icon';

import { AnsibleRole } from '../../../../types/AnsibleContentTypes';
import { AnsibleVariable } from '../../../../types/AnsibleVariableTypes';

interface AnsibleVariablesSelectorProps {
  ansibleRoles: AnsibleRole[];
}

export const AnsibleVariablesSelector = ({
  ansibleRoles,
}: AnsibleVariablesSelectorProps): ReactElement => {
  const [selectedRole, setSelectedRole] = React.useState<string>('');
  const [availableVariables, setAvailableVariables] = React.useState<
    AnsibleVariable[]
  >([]);

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
                    <PanelMainBody>
                      <DataList aria-label="Simple data list example" isCompact>
                        {availableVariables.map(variable => (
                          <DataListItem
                            aria-labelledby="simple-item1"
                            id={variable.name}
                          >
                            <DataListItemRow>
                              <DataListItemCells
                                dataListCells={[
                                  <DataListCell
                                    key="primary content"
                                    wrapModifier={
                                      DataListWrapModifier.breakWord
                                    }
                                  >
                                    <span id="simple-item1">
                                      {variable.name}
                                    </span>
                                  </DataListCell>,
                                  <DataListCell
                                    key="primary content"
                                    wrapModifier={
                                      DataListWrapModifier.breakWord
                                    }
                                  >
                                    <span id="simple-item1">
                                      {JSON.stringify(variable.default_value)}
                                    </span>
                                  </DataListCell>,
                                  <DataListCell
                                    key="primary content"
                                    wrapModifier={
                                      DataListWrapModifier.breakWord
                                    }
                                    alignRight
                                    isFilled={false}
                                  >
                                    <span id="simple-item1">
                                      {variable.type}
                                    </span>
                                  </DataListCell>,
                                  <DataListAction
                                    aria-labelledby="single-action-item1 single-action-action1"
                                    id="single-action-action1"
                                    aria-label="Actions"
                                  >
                                    <Button
                                      onClick={() => {}}
                                      variant="control"
                                      key="view-action"
                                    >
                                      Edit
                                    </Button>
                                  </DataListAction>,
                                ]}
                              />
                            </DataListItemRow>
                          </DataListItem>
                        ))}
                      </DataList>
                    </PanelMainBody>
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
