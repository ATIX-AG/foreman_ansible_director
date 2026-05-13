import React, { ReactElement } from 'react';

import ResourcesEmptyIcon from '@patternfly/react-icons/dist/esm/icons/resources-empty-icon';

import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
} from '@patternfly/react-core';

import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';
import { ContentResolutionNodeType } from '../../../types/AnsibleContentAssignmentTypes';
import { AnsibleContentAssignmentWrapper } from './AnsibleContentAssignmentWrapper';
import { AnsibleContentSource } from '../../../types/AnsibleContentTypes';
import { crnTypeUiString } from './helpers';

interface AnsibleContentAssignmentWrapperWrapperProps {
  crnId: number | null;
  crnType: ContentResolutionNodeType;
  crnName: string;
  contentSource: AnsibleContentSource | null;
}

export const AnsibleContentAssignmentMain = ({
  crnType,
  crnId,
  crnName,
  contentSource,
}: AnsibleContentAssignmentWrapperWrapperProps): ReactElement => {
  if (crnId && contentSource === null) {
    return (
      <EmptyState variant={EmptyStateVariant.lg}>
        <EmptyStateHeader
          titleText={_('No lifecycle environment selected')}
          headingLevel="h4"
          icon={<EmptyStateIcon icon={ResourcesEmptyIcon} />}
        />
        <EmptyStateBody>
          {__(
            _(
              'To manage Ansible content assignments for this %(crnType)s, you must assign an Ansible environment. You can select an Ansible environment for a host group or a host.'
            ),
            { crnType: crnTypeUiString[crnType] }
          )}
        </EmptyStateBody>
      </EmptyState>
    );
  } else if (crnId === null || contentSource === null) {
    return (
      <EmptyState variant={EmptyStateVariant.lg}>
        <EmptyStateHeader
          titleText={_('Save before assigning Ansible content')}
          headingLevel="h4"
          icon={<EmptyStateIcon icon={ResourcesEmptyIcon} />}
        />
        <EmptyStateBody>
          {__(
            _(
              'You must save this %(crnType)s object before you can assign Ansible content.'
            ),
            { crnType: crnTypeUiString[crnType] }
          )}
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <AnsibleContentAssignmentWrapper
      crnId={crnId}
      crnType={crnType}
      crnName={crnName}
      csId={contentSource.id}
    />
  );
};
