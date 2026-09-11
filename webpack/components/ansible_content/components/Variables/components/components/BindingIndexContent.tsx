import React, { ReactElement } from 'react';
import {
  Button,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Label, OverflowMenu,
  OverflowMenuContent,
  OverflowMenuGroup, OverflowMenuItem,
  SearchInput, StackItem,
} from '@patternfly/react-core';
import { InnerScrollContainer, OuterScrollContainer, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { sprintf as __, translate as _ } from 'foremanReact/common/I18n';
import ResourcesEmptyIcon from '@patternfly/react-icons/dist/esm/icons/resources-empty-icon';
import { hierarchyIconMap } from '../../../../../common/AnsibleContentAssignment/AnsibleContentAssignment';
import { AnsibleVariable, AnsibleVariableBinding as AnsibleVariableBindingType } from '../../../../../../types/AnsibleVariableTypes';
import { ConfirmableAction, ConfirmationModal } from '../../../../../../helpers/components/ConfirmationModal';
import { useToasts } from '../../../../../../helpers/toasts/useToasts';
import { AnsibleVariableBinding } from '../../../../../../resources/clients/AnsibleVariableBinding';
import {
  InlineValueRenderer,
} from '../../../../../common/AnsibleContentAssignment/components/Variables/components/InlineValueRenderer';

interface BindingIndexContentProps {
  variable: AnsibleVariable;
  bindings: AnsibleVariableBindingType[];
  onBindingManageClick: (binding: AnsibleVariableBindingType) => void;
  onSuccess: () => void;
}

export const BindingIndexContent = ({
  variable,
  bindings,
  onBindingManageClick,
  onSuccess,
}: BindingIndexContentProps): ReactElement => {

  const [boundNodeFilter, setBoundNodeFilter] = React.useState<string>('');
  const [confirmableAction, setConfirmableAction] = React.useState<ConfirmableAction | null>(null);

  const { withToast } = useToasts();

  return (
    <>
      <StackItem>
        <SearchInput
          placeholder="Find by bound node"
          value={boundNodeFilter}
          onChange={(_event, value) => setBoundNodeFilter(value)}
          onClear={() => setBoundNodeFilter('')}
        />
      </StackItem>
      <StackItem>
        {bindings.length > 0 ? (

          <div>
            <OuterScrollContainer>
              <InnerScrollContainer>
                <Table variant="compact" isStickyHeader>
                  <Thead>
                    <Tr>
                      <Th modifier="nowrap">{_('Bound to')}</Th>
                      <Th modifier="nowrap">{_('Binding value')}</Th>
                      <Th modifier="nowrap">{_('Data type')}</Th>
                      <Th modifier="nowrap" />
                    </Tr>
                  </Thead>
                  <Tbody>
                    {bindings
                      .filter(binding =>
                        binding.consumable_name.startsWith(
                          boundNodeFilter.toLowerCase()
                        ))
                      .map(binding => (
                        <Tr key={binding.id}>
                          <Td
                            dataLabel={_('Bound to')}
                            modifier="nowrap"
                          >
                            <Label
                              icon={hierarchyIconMap[binding.consumable_type]}
                              color={'grey'}
                            >
                              {binding.consumable_name}
                            </Label>
                          </Td>
                          <Td dataLabel={_('Binding value')}>
                            <InlineValueRenderer item={binding} />
                          </Td>
                          <Td dataLabel={_('Data type')}>
                            <Label color="blue" isCompact>
                              {binding.data_type}
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
                                        () => onBindingManageClick(binding)
                                      }
                                    >Manage</Button>
                                  </OverflowMenuItem>
                                  <OverflowMenuItem>
                                    <Button
                                      variant="danger"
                                      onClick={() => {
                                        setConfirmableAction({
                                          title: 'Delete binding?',
                                          body: `Delete binding of variable ${variable.name} to node ${binding.consumable_name}?`,
                                          onAbort: () => setConfirmableAction(null),
                                          onConfirm: async () => {
                                            await withToast(
                                              {
                                                type: 'delete',
                                                resource: 'ansible_variable_binding',
                                                func: AnsibleVariableBinding.destroy(binding.id),
                                              }
                                            );
                                            onSuccess();
                                          },
                                        });
                                      }}
                                    >Delete</Button>
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
        ) : (
          <EmptyState>
            <EmptyStateHeader
              titleText={__(
                _('%(variableName)s is not bound to any nodes.'),
                { variableName: variable.name }
              )}
              headingLevel="h4"
              icon={<EmptyStateIcon icon={ResourcesEmptyIcon} />}
            />
          </EmptyState>
        )}
      </StackItem>
      {confirmableAction !== null && (
        <ConfirmationModal
          isConfirmationModalOpen
          title={confirmableAction.title}
          body={confirmableAction.body}
          onConfirm={confirmableAction.onConfirm}
          onAbort={confirmableAction.onAbort}
        />
      )}
    </>
  );
};
