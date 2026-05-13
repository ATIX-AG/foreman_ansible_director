import React from 'react';
import { Icon, Tooltip } from '@patternfly/react-core';
import {
  CheckIcon,
  TimesIcon,
  PencilAltIcon,
  MigrationIcon,
  TrashIcon,
} from '@patternfly/react-icons';

import { translate as _ } from 'foremanReact/common/I18n';
import { PermittedButton } from '../../../../common/PermittedButton';
import { AdPermissions } from '../../../../../constants/foremanAnsibleDirectorPermissions';

interface HostDetailsLceCardHeaderActionsProps {
  isEditMode: boolean;
  handleEdit: () => void;
  handleAbort: () => void;
  handleInherit: () => void;
  handleUnset: () => void;
}

export const HostDetailsLceCardHeaderActions: React.FC<HostDetailsLceCardHeaderActionsProps> = ({
  isEditMode,
  handleEdit,
  handleAbort,
  handleInherit,
  handleUnset,
}) => (
  <>
    {isEditMode && (
      <>
        <Tooltip content={_('Unassign')}>
          <PermittedButton
            requiredPermissions={[AdPermissions.assignments.create]}
            variant="plain"
            aria-label={_('Unassign')}
            onClick={handleUnset}
          >
            <Icon>
              <TrashIcon />
            </Icon>
          </PermittedButton>
        </Tooltip>
        <Tooltip content={_('Inherit')}>
          <PermittedButton
            requiredPermissions={[AdPermissions.assignments.create]}
            variant="plain"
            aria-label={_('Inherit')}
            onClick={handleInherit}
          >
            <Icon>
              <MigrationIcon />
            </Icon>
          </PermittedButton>
        </Tooltip>
      </>
    )}
    <Tooltip content={isEditMode ? _('Submit') : _('Edit')}>
      <PermittedButton
        requiredPermissions={[AdPermissions.assignments.create]}
        variant="plain"
        aria-label={isEditMode ? _('Submit') : _('Edit')}
        onClick={handleEdit}
      >
        <Icon>{isEditMode ? <CheckIcon /> : <PencilAltIcon />}</Icon>
      </PermittedButton>
    </Tooltip>
    {isEditMode && (
      <Tooltip content={_('Cancel')}>
        <PermittedButton
          requiredPermissions={[AdPermissions.assignments.create]}
          variant="plain"
          aria-label={_('Cancel')}
          onClick={handleAbort}
        >
          <Icon>
            <TimesIcon />
          </Icon>
        </PermittedButton>
      </Tooltip>
    )}
  </>
);
