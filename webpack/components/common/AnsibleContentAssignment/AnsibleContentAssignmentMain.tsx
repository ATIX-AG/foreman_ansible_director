import React, { ReactElement } from 'react';

import { ContentResolutionNodeType } from '../../../types/AnsibleContentAssignmentTypes';
import { AnsibleContentAssignmentWrapper } from './AnsibleContentAssignmentWrapper';
import { AnsibleContentSource } from '../../../types/AnsibleContentTypes';
import { AssignmentContextWrapper } from './AssignmentContext';

interface AnsibleContentAssignmentWrapperWrapperProps {
  dataInterface: 'api' | 'dom';
  crnId: number | null;
  crnType: ContentResolutionNodeType;
  crnName: string | null;
  contentSource: AnsibleContentSource | null;
}

export const AnsibleContentAssignmentMain = ({
  dataInterface,
  crnType,
  crnId,
  crnName,
}: AnsibleContentAssignmentWrapperWrapperProps): ReactElement => {

  return (
    <AssignmentContextWrapper
      dataInterface={dataInterface}
      crnType={crnType}
      crnName={crnName}
      crnId={crnId}
    >
      <AnsibleContentAssignmentWrapper />
    </AssignmentContextWrapper>
  );
};
