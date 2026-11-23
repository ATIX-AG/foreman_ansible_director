import React, { ReactElement } from 'react';
import {
  Button,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Label, OverflowMenu,
  OverflowMenuContent,
  OverflowMenuGroup, OverflowMenuItem,
  Popover,
  SearchInput, StackItem,
} from '@patternfly/react-core';
import { InnerScrollContainer, OuterScrollContainer, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { sprintf as __, translate as _ } from 'foremanReact/common/I18n';
import ResourcesEmptyIcon from '@patternfly/react-icons/dist/esm/icons/resources-empty-icon';
import EditIcon from '@patternfly/react-icons/dist/esm/icons/edit-icon';
import { hierarchyIconMap } from '../../../../../common/AnsibleContentAssignment/AnsibleContentAssignment';
import { AnsibleVariable, AnsibleVariableBinding as AnsibleVariableBindingType } from '../../../../../../types/AnsibleVariableTypes';
import { BindingDeleteButton } from '../../../../../../helpers/components/BindingDeleteButton';
import {
  InlineValueRenderer,
} from '../../../../../common/AnsibleContentAssignment/components/Variables/components/InlineValueRenderer';
import { dataTypeDisplayNameMap } from '../../../../../common/AnsibleContentAssignment/components/Variables/utils';

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

  return (
    <>
      <StackItem>
        <SearchInput
          placeholder={_('Filter by host or host group')}
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
                              {dataTypeDisplayNameMap[binding.data_type]}
                            </Label>
                          </Td>
                          <Td isActionCell>
                            <OverflowMenu breakpoint="lg">
                              <OverflowMenuContent>
                                <OverflowMenuGroup groupType="button">
                                  <OverflowMenuItem>
                                    <Popover bodyContent={_('Edit binding')} triggerAction="hover">
                                      <Button
                                        variant="plain"
                                        icon={<EditIcon />}
                                        aria-label={_('Manage')}
                                        onClick={
                                          () => onBindingManageClick(binding)
                                        }
                                      />
                                    </Popover>
                                  </OverflowMenuItem>
                                  <OverflowMenuItem>
                                    <BindingDeleteButton
                                      binding={binding}
                                      variableName={variable.name}
                                      onDeleted={onSuccess}
                                    />
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
                _('%(variableName)s is not bound to any host or host group'),
                { variableName: variable.name }
              )}
              headingLevel="h4"
              icon={<EmptyStateIcon icon={ResourcesEmptyIcon} />}
            />
          </EmptyState>
        )}
      </StackItem>
    </>
  );
};
