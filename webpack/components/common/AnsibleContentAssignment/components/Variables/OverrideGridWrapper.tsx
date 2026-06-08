import React, { ReactElement } from 'react';

import { HostOverrideTable } from './HostOverrideTable';
import { ContentResolutionNodeType } from '../../../../../types/AnsibleContentAssignmentTypes';

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
}: OverrideGridWrapperProps): ReactElement => (
  <HostOverrideTable
    crnType={crnType}
    crnId={crnId}
    matcherType={matcherType}
    matcherName={matcherName}
  />
);
