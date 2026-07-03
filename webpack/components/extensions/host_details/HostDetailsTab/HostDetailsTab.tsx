import React, { ReactElement } from 'react';
import {
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Spinner,
} from '@patternfly/react-core';

import { UseAPIReturn } from 'foremanReact/common/hooks/API/APIHooks';
import { translate as _ } from 'foremanReact/common/I18n';

import { AnsibleContentAssignmentMain } from '../../../common/AnsibleContentAssignment/AnsibleContentAssignmentMain';
import { AnsibleContentSource } from '../../../../types/AnsibleContentTypes';

interface HostDetailsTabProps
  extends UseAPIReturn<{
    ansible_content_source: AnsibleContentSource | null;
    id: number;
    name: string;
  }> {}

export const HostDetailsTab = ({
  status,
  response,
}: HostDetailsTabProps): ReactElement => {
  if (status === 'RESOLVED') {
    return (
      <AnsibleContentAssignmentMain
        crnId={response.id}
        crnType="Host"
        crnName={response.name}
        contentSource={response.ansible_content_source}
      />
    );
  }
  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={_('Loading host details...')}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={Spinner} />}
      />
    </EmptyState>
  );
};
