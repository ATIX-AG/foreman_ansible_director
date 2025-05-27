import React from 'react';
import {
  DualListSelector,
  DualListSelectorTreeItemData,
} from '@patternfly/react-core';
import { ContentUnitSelector } from './components/ContentUnitSelector';
import { useAPI, UseAPIReturn } from 'foremanReact/common/hooks/API/APIHooks';
import { AnsibleContentUnit } from '../../../../types/AnsibleContentTypes';

interface GetContentUnitsResponse {
  results: AnsibleContentUnit[];
}

export const ContentUnitSelectorWrapper: React.FunctionComponent = () => {
  const [availableOptions, setAvailableOptions] = React.useState<
    DualListSelectorTreeItemData[]
  >([]);

  const contentUnitResponse = useAPI<GetContentUnitsResponse>(
    'get',
    '/api/v2/pulsible/ansible_content'
  );


  if (contentUnitResponse.status === 'RESOLVED') {
    return (
      <ContentUnitSelector
        contentUnits={contentUnitResponse.response.results}
      />
    );
  } else if (contentUnitResponse.status === 'ERROR') {
    return null; // TODO: handle request error
  }
  return 'empty';
};
