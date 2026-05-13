import React, { ReactElement } from 'react';

import { useAPI } from 'foremanReact/common/hooks/API/APIHooks';
import {
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Spinner,
} from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';
import {
  AnsibleContentAssignment,
  ContentResolutionNode,
  ContentResolutionNodeType,
  ResolvedAssignment,
} from '../../../types/AnsibleContentAssignmentTypes';
import { AnsibleContentAssignmentComp } from './AnsibleContentAssignment';
import { DefaultResponse } from '../../../types/common';
import { AnsibleDirectorError } from '../../../types/issues/errors';
import { ResolutionWarning } from '../../../types/issues/warnings';
import { crnTypeUrlMap } from './helpers';

interface AnsibleContentAssignmentWrapperProps {
  crnId: number;
  crnType: ContentResolutionNodeType;
  crnName: string;
  csId: number;
}

interface GetCrnAssignmentsResponse {
  assignments: ResolvedAssignment<AnsibleContentAssignment>[];
  hierarchy: ContentResolutionNode[];
}

export const AnsibleContentAssignmentWrapper = ({
  crnType,
  crnId,
  crnName,
  csId,
}: AnsibleContentAssignmentWrapperProps): ReactElement => {
  const getCrnAssignmentsRequest = useAPI<
    DefaultResponse<
      AnsibleDirectorError,
      ResolutionWarning,
      GetCrnAssignmentsResponse
    >
  >(
    'get',
    `/api/v2/ansible_director/assignments/${crnTypeUrlMap[crnType]}/${crnId}?resolve=true`
  );

  const refreshRequest = (): void => {
    getCrnAssignmentsRequest.setAPIOptions(options => ({ ...options }));
  };

  if (getCrnAssignmentsRequest.status === 'ERROR') {
    // TODO: Handle
  } else if (getCrnAssignmentsRequest.status === 'RESOLVED') {
    return (
      <AnsibleContentAssignmentComp
        crnId={crnId}
        crnType={crnType}
        crnName={crnName}
        csId={csId}
        hierarchy={getCrnAssignmentsRequest.response.results.hierarchy}
        assignments={getCrnAssignmentsRequest.response.results.assignments}
        warnings={getCrnAssignmentsRequest.response.warnings}
        onResolveClick={() => refreshRequest()}
      />
    );
  }

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={_('Loading Ansible content assignments...')}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={Spinner} />}
      />
    </EmptyState>
  );
};
