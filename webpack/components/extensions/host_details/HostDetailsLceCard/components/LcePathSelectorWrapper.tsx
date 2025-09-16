import React, { Dispatch, ReactElement, SetStateAction } from 'react';
import { foremanUrl } from 'foremanReact/common/helpers';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import EmptyPage from 'foremanReact/routes/common/EmptyPage';
import { IndexResponse, useAPI } from 'foremanReact/common/hooks/API/APIHooks';
import { AnsibleLcePath } from '../../../../../types/AnsibleEnvironmentsTypes';
import { LcePathSelector } from './LcePathSelector';

interface LcePathSelectorWrapperProps {
  isEditMode: boolean;
  selectedLcePath: string | undefined;
  setSelectedLcePath: Dispatch<SetStateAction<string>>;
  selectedLce: string | undefined;
  setSelectedLce: Dispatch<SetStateAction<string>>;
  availableLcePaths: AnsibleLcePath[];
  setAvailableLcePaths: Dispatch<SetStateAction<AnsibleLcePath[]>>;
}
interface LcePathsResponse extends IndexResponse {
  results: AnsibleLcePath[];
}

export const LcePathSelectorWrapper = ({
  isEditMode,
  selectedLcePath,
  setSelectedLcePath,
  selectedLce,
  setSelectedLce,
  availableLcePaths,
  setAvailableLcePaths,
}: LcePathSelectorWrapperProps): ReactElement | null => {
  const organization = useForemanOrganization();

  const getLcePathsResponse = useAPI<LcePathsResponse>(
    'get',
    foremanUrl(
      `/api/v2/ansible/lifecycle_environments/paths?order=name&${
        organization ? `organization_id=${organization.id}&` : ''
      }`
    )
  );

  if (getLcePathsResponse.status === 'RESOLVED') {
    setAvailableLcePaths(getLcePathsResponse.response.results);
  } else if (getLcePathsResponse.status === 'ERROR') {
    // TODO: Handle request error
    return null;
  } else if (getLcePathsResponse.status === 'PENDING') {
    return (
      <EmptyPage
        message={{
          type: 'loading',
          text: 'Loading Lifecycle Environment Paths...',
        }}
      />
    );
  }

  return (
    <LcePathSelector
      lcePaths={availableLcePaths}
      isEditMode={isEditMode}
      selectedLcePath={selectedLcePath}
      setSelectedLcePath={setSelectedLcePath}
      selectedLce={selectedLce}
      setSelectedLce={setSelectedLce}
    />
  );
};
