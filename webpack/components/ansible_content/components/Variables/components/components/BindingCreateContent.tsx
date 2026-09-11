import React, { ReactElement, useMemo } from 'react';
import {
  Alert,
  Button,
  DrawerContentBody,
  Stack,
  StackItem, Text, TextContent,
  Tile,
} from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';
import { TargetNodeSelector } from '../../../AnsibleVariablesOverview/VariableManagementModal/TargetNodeSelector';
import { ContentResolutionNodeType } from '../../../../../../types/AnsibleContentAssignmentTypes';
import { hierarchyIconMap } from '../../../../../common/AnsibleContentAssignment/AnsibleContentAssignment';
import {
  contentResolutionNodeTypeIdentifiers,
  crnTypeUiStringTitle,
} from '../../../../../common/AnsibleContentAssignment/helpers';

import {
  AnsibleVariableDataType,
} from '../../../../../../types/AnsibleVariableTypes';
import { AnsibleVariable,
  AnsibleVariableBinding as AnsibleVariableBindingType } from '../../../../../../types/AnsibleVariableTypes';
import {
  ValueCard,
} from '../../../../../common/AnsibleContentAssignment/components/Variables/components/components/ValueCard';
import { getYamlValidity } from '../../../../../common/AnsibleContentAssignment/components/Variables/utils';
import { useToasts } from '../../../../../../helpers/toasts/useToasts';
import { AnsibleVariableBinding } from '../../../../../../resources/clients/AnsibleVariableBinding';
import { CollectionRoleAssignable } from '../../../../../../types/DynamicAssignmentTypes';

interface BindingCreateContentProps {
  assignable: CollectionRoleAssignable;
  allBindings: AnsibleVariableBindingType[];
  variable: AnsibleVariable;
  onSuccess: () => void;
  onAbort: () => void;
}

export const BindingCreateContent = ({
  assignable,
  allBindings,
  variable,
  onSuccess,
  onAbort,
}: BindingCreateContentProps): ReactElement => {

  const [targetNodeType, setTargetNodeType] = React.useState<ContentResolutionNodeType>('Host');
  const [targetNode, setTargetNode] = React.useState<
    { id: number; name: string; type: 'host' | 'hostgroup' } | null
  >(null);

  const [dataType, setDataType] = React.useState<AnsibleVariableDataType>(variable.data_type);
  const [rawValue, setRawValue] = React.useState<string>(variable.raw_value);

  const yamlValidity = useMemo(() => {
    return getYamlValidity(rawValue, dataType);
  }, [dataType, rawValue]);

  const isDuplicateBinding: boolean = useMemo(() => (
    allBindings.findIndex(b => b.consumable_type === targetNodeType && b.consumable_id === targetNode?.id) !== -1
  ), [allBindings, targetNode, targetNodeType]);

  const { withToast } = useToasts();

  return (
    <>
      <StackItem>
        <DrawerContentBody>
          <Stack>

            <StackItem>
              <div role="listbox">
                {
                  contentResolutionNodeTypeIdentifiers.map(crnType => (
                    <Tile
                      title={crnTypeUiStringTitle[crnType]}
                      icon={hierarchyIconMap[crnType]}
                      isSelected={targetNodeType === crnType}
                      onClick={() => setTargetNodeType(crnType)}
                    />
                  ))
                }
              </div>
            </StackItem>
            {isDuplicateBinding && (
              <Alert
                title={_(
                  'Duplicate binding'
                )}
                variant="danger"
                isInline
              >
                <TextContent>
                  <Text component="p">
                    {_(
                      `A binding of this variable to ${targetNode?.name} already exists. Edit this binding instead of creating a new one.`
                    )}
                  </Text>
                </TextContent>
              </Alert>
            )}
            <StackItem>
              <TargetNodeSelector
                selectedNode={targetNode}
                onNodeSelect={matcherValue => setTargetNode(matcherValue)}
                nodeType={targetNodeType}
              />
            </StackItem>
            <StackItem>
              <Stack>
                <ValueCard
                  variant={'bindingCreate'}
                  itemType={dataType}
                  itemValue={rawValue}
                  valueQuery={'local'}
                  valueTransformer={'static'}
                  onItemTypeChange={type => setDataType(type)}
                  onItemValueChange={value => setRawValue(value)}
                  isDisabled={false}
                />
              </Stack>
            </StackItem>
          </Stack>
        </DrawerContentBody>
      </StackItem>
      <StackItem isFilled />
      <StackItem>
        <div style={{ padding: '0 0 1rem 1rem' }}>
          <Button
            key="confirm"
            variant={yamlValidity.state === 'type_mismatch' ? 'warning' : 'primary'}
            isDisabled={yamlValidity.state === 'invalid' || targetNode === null || isDuplicateBinding}
            onClick={async () => {
              targetNode !== null && (
                await (async () => {
                  await withToast({
                    type: 'update',
                    resource: 'ansible_variable_binding',
                    func: AnsibleVariableBinding.create({
                      ansible_variable_binding: {
                        data_type: dataType,
                        raw_value: rawValue,
                        variable_name: variable.name,
                        assignable_type: assignable.assignable_type,
                        assignable_namespace: assignable.assignable_namespace,
                        assignable_name: assignable.assignable_name,
                        assignable_role_name: assignable.assignable_role_name,
                        target: targetNode.type,
                        target_id: targetNode.id,
                      },
                    }),
                  });
                  onSuccess();
                })()
              );
            }}
          >
            {yamlValidity.state === 'type_mismatch' ? 'Confirm (I know what I am doing)' : 'Confirm'}
          </Button>
          <Button
            key="cancel"
            variant="link"
            onClick={onAbort}
          >
            Cancel
          </Button>
        </div>
      </StackItem>
    </>

  );

};
