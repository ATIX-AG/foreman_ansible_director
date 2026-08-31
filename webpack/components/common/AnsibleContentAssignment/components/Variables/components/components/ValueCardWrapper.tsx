import React, { ReactElement } from 'react';
import {
  AnsibleVariable,
  AnsibleVariableBinding,
  AnsibleVariableDataType,
} from '../../../../../../../types/AnsibleVariableTypes';
import { ValueCard } from './ValueCard';
import { ContentResolutionNode } from '../../../../../../../types/AnsibleContentAssignmentTypes';
import { useAdContext } from '../../../../../../../helpers/adContext';

interface ValueCardWrapperPropsForVariable {
  variant: 'variable';
  item: AnsibleVariable;
  crn?: never;
}

interface ValueCardWrapperPropsForBinding {
  variant: 'binding';
  item: AnsibleVariableBinding;
  crn: ContentResolutionNode;
}

interface BaseProps {
  isTargetNode: boolean;
  draftType: AnsibleVariableDataType;
  draftValue: string;
  onDraftTypeChange: (type: AnsibleVariableDataType) => void;
  onDraftValueChange: (value: string) => void;
}

type ValueCardWrapperProps = BaseProps & (ValueCardWrapperPropsForVariable | ValueCardWrapperPropsForBinding);

export const ValueCardWrapper = ({
  variant,
  crn,
  isTargetNode,
  draftType,
  draftValue,
  onDraftTypeChange,
  onDraftValueChange,
}: ValueCardWrapperProps): ReactElement => {

  const ctx = useAdContext();

  const formattedValueCard = (): ReactElement => {
    if (variant === 'variable') {
      return (
        <ValueCard
          onItemTypeChange={onDraftTypeChange}
          onItemValueChange={onDraftValueChange}
          variant={'variable'}
          itemType={draftType}
          itemValue={draftValue}
          valueTransformer={'static'}
          valueQuery={'local'}
          isDisabled={!isTargetNode && !ctx.settings.ansible_director_vars_cross_node_editing}
        />
      );
    }
    else {
      return (
        <ValueCard
          onItemTypeChange={onDraftTypeChange}
          onItemValueChange={onDraftValueChange}
          variant={'binding'}
          itemType={draftType}
          itemValue={draftValue}
          valueTransformer={'static'}
          valueQuery={'local'}
          crn={crn}
          isDisabled={!isTargetNode && !ctx.settings.ansible_director_vars_cross_node_editing}
        />
      );
    }
  };

  return formattedValueCard();

};
