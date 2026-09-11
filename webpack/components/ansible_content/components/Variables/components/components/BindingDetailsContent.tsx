import React, { ReactElement, useMemo } from 'react';
import { Button, DrawerContentBody, Stack, StackItem } from '@patternfly/react-core';

import {
  AnsibleVariableBinding as AnsibleVariableBindingType,
  AnsibleVariableDataType,
} from '../../../../../../types/AnsibleVariableTypes';
import {
  ValueCard,
} from '../../../../../common/AnsibleContentAssignment/components/Variables/components/components/ValueCard';
import { getYamlValidity } from '../../../../../common/AnsibleContentAssignment/components/Variables/utils';
import { useToasts } from '../../../../../../helpers/toasts/useToasts';
import { AnsibleVariableBinding } from '../../../../../../resources/clients/AnsibleVariableBinding';
import { ContentResolutionNode } from '../../../../../../types/AnsibleContentAssignmentTypes';

interface BindingDetailsContentProps {
  binding: AnsibleVariableBindingType;
  boundNode: ContentResolutionNode;
  onSuccess: () => void;
  onAbort: () => void;
}

export const BindingDetailsContent = ({
  binding,
  boundNode,
  onAbort,
  onSuccess,
}: BindingDetailsContentProps): ReactElement => {

  const [dataType, setDataType] = React.useState<AnsibleVariableDataType>(binding.data_type);
  const [rawValue, setRawValue] = React.useState<string>(binding.raw_value);

  const yamlValidity = useMemo(() => {
    return getYamlValidity(rawValue, dataType);
  }, [dataType, rawValue]);

  const { withToast } = useToasts();

  return (
    <>
      <StackItem>
        <DrawerContentBody>
          <Stack hasGutter style={{ paddingTop: '15px', paddingBottom: '15px' }}>
            <ValueCard
              variant="binding"
              itemType={dataType}
              itemValue={rawValue}
              valueQuery={'local'}
              valueTransformer={'static'}
              onItemTypeChange={type => setDataType(type)}
              onItemValueChange={value => setRawValue(value)}
              isDisabled={false}
              crn={boundNode}
            />
          </Stack>
        </DrawerContentBody>
      </StackItem>
      <StackItem isFilled />
      <StackItem>
        <div style={{ padding: '0 0 1rem 1rem' }}>
          <Button
            key="confirm"
            variant={yamlValidity.state === 'type_mismatch' ? 'warning' : 'primary'}
            isDisabled={yamlValidity.state === 'invalid'}
            onClick={async () => {
              await withToast({
                type: 'update',
                resource: 'ansible_variable_binding',
                func: AnsibleVariableBinding.updatePartial(binding.id, {
                  ansible_variable_binding: {
                    data_type: dataType,
                    raw_value: rawValue,
                  },
                }),
              });
              onSuccess();
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
