import React, { ReactElement, useContext } from 'react';
import ResourcesEmptyIcon from '@patternfly/react-icons/dist/esm/icons/resources-empty-icon';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant, Spinner,
} from '@patternfly/react-core';
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';

import { AssignmentContext } from './AssignmentContext';

import { crnTypeUiString } from './helpers';

import { AnsibleContentAssignmentComp } from './AnsibleContentAssignment';

export const AnsibleContentAssignmentWrapper = (): ReactElement | null => {

  const assignmentCtx = useContext(AssignmentContext);

  if (!assignmentCtx) {
    return null;
  }

  if (assignmentCtx.requestStatus.getAssignments === 'PENDING') {
    return (
      <EmptyState>
        <EmptyStateHeader
          titleText={_('Loading assignments...')}
          headingLevel="h4"
          icon={<EmptyStateIcon icon={Spinner} />}
        />
      </EmptyState>
    );
  }

  if (assignmentCtx.csId === null) {
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
            { crnType: crnTypeUiString[assignmentCtx.crnType] }
          )}
        </EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <>
      {assignmentCtx.dataInterface === 'dom' && (
        <input
          type="hidden"
          name={`${assignmentCtx.crnType.toLowerCase()}[ansible_director_assignment_data]`}
          id="ansible_director_assignment_data"
          value={JSON.stringify(assignmentCtx.domAssignments)}
        />)}
      <AnsibleContentAssignmentComp
        crnId={assignmentCtx.crnId}
        crnType={assignmentCtx.crnType}
        crnName={assignmentCtx.crnName}
        csId={assignmentCtx.csId}
        hierarchy={assignmentCtx.hierarchy}
        assignments={assignmentCtx.assignments}
        resolutionWarnings={assignmentCtx.resolutionWarnings}
      />
    </>
  );
};
