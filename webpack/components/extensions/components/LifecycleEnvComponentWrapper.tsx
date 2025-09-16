import React from 'react';
import { foremanUrl } from 'foremanReact/common/helpers';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import EmptyPage from 'foremanReact/routes/common/EmptyPage';
import { useAPI } from 'foremanReact/common/hooks/API/APIHooks';
import { AnsibleLcePath } from '../../../types/AnsibleEnvironmentsTypes';

interface LifecycleEnvComponentWrapperProps {
  children: React.ReactNode;
}

export const LifecycleEnvComponentWrapper: React.FC<LifecycleEnvComponentWrapperProps> = ({
  children,
}) => {
  const organization = useForemanOrganization();

  const getLcePathsResponse = useAPI<AnsibleLcePath>(
    'get',
    foremanUrl(
      `/api/v2/ansible/lifecycle_environments/paths?order=name&${
        organization ? `organization_id=${organization.id}&` : ''
      }`
    )
  );

  if (getLcePathsResponse.status === 'RESOLVED') {
    return <>{children}</>;
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
