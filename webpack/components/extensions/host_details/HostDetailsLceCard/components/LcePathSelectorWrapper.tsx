import React, {
  Dispatch,
  ReactElement,
  SetStateAction,
  useEffect,
} from 'react';
import { Skeleton } from '@patternfly/react-core';
import { foremanUrl } from 'foremanReact/common/helpers';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import { IndexResponse, useAPI } from 'foremanReact/common/hooks/API/APIHooks';
import {
  AnsibleLcePath,
  SparseAnsibleLce,
} from '../../../../../types/AnsibleEnvironmentsTypes';
import { LcePathSelector } from './LcePathSelector';

interface LcePathSelectorWrapperProps {
  isEditMode: boolean;
  selectedLcePath: string;
  setSelectedLcePath: Dispatch<SetStateAction<string>>;
  selectedLce: string;
  setSelectedLce: Dispatch<SetStateAction<string>>;
  availableLcePaths: AnsibleLcePath[];
  setAvailableLcePaths: Dispatch<SetStateAction<AnsibleLcePath[]>>;
  hostDetails: {
    id: number;
    name: string;
    // eslint-disable-next-line camelcase
    ansible_lifecycle_environment_id: number | null;
  };
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
  hostDetails,
}: LcePathSelectorWrapperProps): ReactElement | null => {
  const organization = useForemanOrganization();

  const LCE_PATH_SELECTOR_PLACEHOLDER = 'Lifecycle environment path';

  const getLcePathsResponse = useAPI<LcePathsResponse>(
    'get',
    foremanUrl(
      `/api/v2/ansible_director/lifecycle_environments/paths?order=name&${
        organization ? `organization_id=${organization.id}&` : ''
      }`
    )
  );

  useEffect(() => {
    if (getLcePathsResponse.status === 'RESOLVED') {
      setAvailableLcePaths(getLcePathsResponse.response.results);

      if (
        selectedLcePath === LCE_PATH_SELECTOR_PLACEHOLDER &&
        getLcePathsResponse.response.results.length !== 0
      ) {
        let lcePath: string = selectedLcePath;
        let lce: string = selectedLce;

        for (let i = 0; i < getLcePathsResponse.response.results.length; i++) {
          const pathLces: SparseAnsibleLce[] =
            getLcePathsResponse.response.results[i].lifecycle_environments;
          for (let j = 0; j < pathLces.length; j++) {
            if (
              pathLces[j].id === hostDetails.ansible_lifecycle_environment_id
            ) {
              lcePath = getLcePathsResponse.response.results[i].name;
              lce = pathLces[j].name;
              break;
            }
          }
          if (lcePath !== selectedLcePath) break;
        }

        setSelectedLcePath(lcePath);
        setSelectedLce(lce);
      }
    }
  }, [
    getLcePathsResponse,
    hostDetails.ansible_lifecycle_environment_id,
    selectedLce,
    selectedLcePath,
    setAvailableLcePaths,
    setSelectedLce,
    setSelectedLcePath,
  ]);

  if (getLcePathsResponse.status === 'RESOLVED') {
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
  } else if (getLcePathsResponse.status === 'ERROR') {
    // TODO: Handle request error
    return null;
  }

  return (
    <>
      <Skeleton screenreaderText="Loading lce path" />
      <br />
      <Skeleton screenreaderText="Loading lce" />
    </>
  );
};
