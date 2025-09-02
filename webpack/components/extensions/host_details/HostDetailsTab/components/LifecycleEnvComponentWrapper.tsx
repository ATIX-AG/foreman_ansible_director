import React, { ReactElement } from 'react';
import { foremanUrl } from 'foremanReact/common/helpers';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import EmptyPage from 'foremanReact/routes/common/EmptyPage';
import { IndexResponse, useAPI } from 'foremanReact/common/hooks/API/APIHooks';
import { AnsibleLcePath } from '../../../../../types/AnsibleEnvironmentsTypes';
import { LcePathSelector } from './LcePathSelector';

interface LcePathsResponse extends IndexResponse {
  results: AnsibleLcePath[];
}

export const LifecycleEnvComponentWrapper = (): ReactElement | null => {
  const organization = useForemanOrganization();

  const getLcePathsResponse = useAPI<LcePathsResponse>(
    'get',
    foremanUrl(
      `/api/v2/pulsible/lifecycle_environments/paths?order=name&${
        organization ? `organization_id=${organization.id}&` : ''
      }`
    )
  );

  if (getLcePathsResponse.status === 'RESOLVED') {
    return <LcePathSelector lcePaths={getLcePathsResponse.response.results} />;
  } else if (getLcePathsResponse.status === 'ERROR') {
    // TODO: Handle request error
    return null;
  }

  return (
    <EmptyPage
      message={{
        type: 'loading',
        text: 'Loading Lifecycle Environment Paths...',
      }}
    />
  );
};
