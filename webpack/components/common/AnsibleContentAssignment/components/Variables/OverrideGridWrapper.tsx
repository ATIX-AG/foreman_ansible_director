import React, { ReactElement } from 'react';
import { useAPI } from 'foremanReact/common/hooks/API/APIHooks';
import { foremanUrl } from 'foremanReact/common/helpers';
import {
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Spinner,
} from '@patternfly/react-core';
import { addToast } from 'foremanReact/components/ToastsList';
import { translate as _ } from 'foremanReact/common/I18n';
import { useDispatch } from 'react-redux';

import { MergedVariableOverride } from '../../../../../types/AnsibleVariableTypes';
import { OverrideGrid } from './OverrideGrid';
import { ContentResolutionNodeType } from '../../../../../types/AnsibleContentAssignmentTypes';
import { crnTypeUrlMap } from '../../../../common/AnsibleContentAssignment/helpers';

interface OverrideGridWrapperProps {
  crnType: ContentResolutionNodeType;
  crnId: number;
  matcherName: string;
  matcherType: string;
}

export const OverrideGridWrapper = ({
  crnType,
  crnId,
  matcherType,
  matcherName,
}: OverrideGridWrapperProps): ReactElement => {
  const dispatch = useDispatch();

  const overridesRequest = useAPI<MergedVariableOverride[]>(
    'get',
    foremanUrl(
      `/api/v2/ansible_director/ansible_variables/overrides/${crnTypeUrlMap[crnType]}/${crnId}?include_overridable=1`
    )
  );

  if (overridesRequest.status === 'ERROR') {
    dispatch(
      addToast({
        type: 'danger',
        key: `GET_${crnType}_${crnId}_ANSIBLE_VAR_OVERRIDES`,
        message: 'Requesting Ansible variable overrides failed".',
        sticky: false,
      })
    );
    return <div>Placeholder error component</div>;
  } else if (overridesRequest.status === 'RESOLVED') {
    return (
      <OverrideGrid
        overrides={
          Object.keys(overridesRequest.response).length === 0
            ? []
            : overridesRequest.response
        }
        matcherType={matcherType}
        matcherName={matcherName}
        crnType={crnType}
      />
    );
  }

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={_('Loading lifecycle environment content...')}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={Spinner} />}
      />
    </EmptyState>
  );
};
