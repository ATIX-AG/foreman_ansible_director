import React, { Dispatch, SetStateAction } from 'react';
import {
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Spinner,
} from '@patternfly/react-core';
import { useAPI } from 'foremanReact/common/hooks/API/APIHooks';
import { ContentUnitSelector } from './components/ContentUnitSelector';
import { AnsibleContentUnit } from '../../../../types/AnsibleContentTypes';
import {
  AnsibleExecutionEnv,
  AnsibleExecutionEnvCreate,
} from '../../../../types/AnsibleExecutionEnvTypes';
import { AnsibleLce } from '../../../../types/AnsibleEnvironmentsTypes';

interface ContentUnitSelectorWrapperProps {
  executionEnvironment:
    | AnsibleExecutionEnv
    | AnsibleExecutionEnvCreate
    | AnsibleLce;
  chosenUnits: {
    [unit: number]: string;
  };
  setChosenUnits: Dispatch<SetStateAction<{ [unit: number]: string }>>;
}

interface GetContentUnitsResponse {
  results: AnsibleContentUnit[];
}

export const ContentUnitSelectorWrapper: React.FC<ContentUnitSelectorWrapperProps> = ({
  executionEnvironment,
  chosenUnits,
  setChosenUnits,
}) => {
  const contentUnitResponse = useAPI<GetContentUnitsResponse>(
    'get',
    '/api/v2/pulsible/ansible_content'
  );

  if (contentUnitResponse.status === 'RESOLVED') {
    return (
      <ContentUnitSelector
        contentUnits={contentUnitResponse.response.results}
        targetContentUnits={executionEnvironment.content}
        chosenUnits={chosenUnits}
        setChosenUnits={setChosenUnits}
      />
    );
  } else if (contentUnitResponse.status === 'ERROR') {
    return null; // TODO: handle request error
  }
  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={`Loading content for Execution environment "${executionEnvironment.name}"...`}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={Spinner} />}
      />
    </EmptyState>
  );
};
