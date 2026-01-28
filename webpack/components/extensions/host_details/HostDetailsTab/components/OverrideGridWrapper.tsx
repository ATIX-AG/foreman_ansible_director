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
import { useDispatch } from 'react-redux';

import { MergedVariableOverride } from '../../../../../types/AnsibleVariableTypes';
import { OverrideGrid } from './OverrideGrid';

interface OverrideGridWrapperProps {
  hostId: number;
  fqdn: string;
}

export const OverrideGridWrapper = ({
  hostId,
  fqdn,
}: OverrideGridWrapperProps): ReactElement => {
  const dispatch = useDispatch();

  const overridesRequest = useAPI<MergedVariableOverride[]>(
    'get',
    foremanUrl(
      `/api/v2/ansible_director/ansible_variables/overrides/HOST/${hostId}?include_overridable=1`
    )
  );

  if (overridesRequest.status === 'ERROR') {
    dispatch(
      addToast({
        type: 'danger',
        key: `GET_HOST_${hostId}_ANSIBLE_VAR_OVERRIDES`,
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
        fqdn={fqdn}
      />
    );
  }

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText="Loading Lifecycle Environment content..."
        headingLevel="h4"
        icon={<EmptyStateIcon icon={Spinner} />}
      />
    </EmptyState>
  );
};
