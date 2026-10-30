import React, { ReactElement } from 'react';
import { Button, Icon, Popover } from '@patternfly/react-core';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import SaveIcon from '@patternfly/react-icons/dist/esm/icons/save-icon';
import EditIcon from '@patternfly/react-icons/dist/esm/icons/edit-icon';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';

import { translate as _ } from 'foremanReact/common/I18n';

import { ExecutionEnvironment } from '../../../types/AnsibleExecutionEnvTypes';
import { ExecutionEnvCardConfig } from './executionEnvCardConfig';
import { PermittedButton } from '../../common/PermittedButton';
import { AdPermissions } from '../../../constants/foremanAnsibleDirectorPermissions';
import { ExecutionEnvStatusButton } from './ExecutionEnvStatusButton';

type ExecutionEnvCardActionsProps =
  | {
    mode: 'view';
    config: ExecutionEnvCardConfig;
    executionEnv: ExecutionEnvironment;
    onDelete: () => void;
    onEdit: () => void;
  }
  | {
    mode: 'edit';
    config: ExecutionEnvCardConfig;
    inputValid: boolean;
    onSave: () => void;
    onAbort: () => void;
  };

const saveHelp = (rebuildsOnChange: boolean): string =>
  rebuildsOnChange
    ? _(
      'Save changes made to this Execution Environment. Foreman will rebuild the Execution Environment.'
    )
    : _('Save changes made to this Execution Environment.');

const editHelp = (rebuildsOnChange: boolean): string =>
  rebuildsOnChange
    ? _(
      'Edit this Execution Environment. If you make a change, Foreman will rebuild the Execution Environment.'
    )
    : _('Edit this Execution Environment.');

const DeleteButton = ({ onDelete }: { onDelete: () => void }): ReactElement => (
  <PermittedButton
    requiredPermissions={[AdPermissions.executionEnvironments.destroy]}
    hasPopover
    popoverProps={{
      triggerAction: 'hover',
      'aria-label': _('destroy popover'),
      headerComponent: 'h1',
      headerContent: _('Delete'),
      bodyContent: <div>{_('Delete this Execution Environment.')}</div>,
    }}
    variant="plain"
    aria-label={_('Delete Execution Environment')}
    onClick={onDelete}
  >
    <Icon size="lg">
      <TrashIcon />
    </Icon>
  </PermittedButton>
);

export const ExecutionEnvCardActions = (
  props: ExecutionEnvCardActionsProps
): ReactElement | null => {
  switch (props.mode) {
    case 'edit':
      return (
        <>
          <PermittedButton
            requiredPermissions={[AdPermissions.executionEnvironments.edit]}
            hasPopover
            popoverProps={{
              triggerAction: 'hover',
              'aria-label': _('edit popover'),
              headerComponent: 'h1',
              headerContent: _('Save changes'),
              bodyContent: <div>{saveHelp(props.config.rebuildsOnChange)}</div>,
            }}
            variant="plain"
            aria-label="Action"
            onClick={props.onSave}
            isDisabled={!props.inputValid}
          >
            <Icon size="lg">
              <SaveIcon />
            </Icon>
          </PermittedButton>
          <Popover
            triggerAction="hover"
            aria-label={_('abort popover')}
            headerComponent="h1"
            headerContent={_('Cancel')}
            bodyContent={null}
          >
            <Button
              variant="plain"
              aria-label={_('Cancel')}
              onClick={props.onAbort}
            >
              <Icon size="lg">
                <TimesIcon />
              </Icon>
            </Button>
          </Popover>
        </>
      );
    case 'view':
      return (
        <>
          <ExecutionEnvStatusButton executionEnv={props.executionEnv} />
          <DeleteButton onDelete={props.onDelete} />
          {props.config.editableFields.length > 0 && (
            <PermittedButton
              requiredPermissions={[AdPermissions.executionEnvironments.edit]}
              hasPopover
              popoverProps={{
                triggerAction: 'hover',
                'aria-label': _('edit popover'),
                headerComponent: 'h1',
                headerContent: _('Edit'),
                bodyContent: (
                  <div>{editHelp(props.config.rebuildsOnChange)}</div>
                ),
              }}
              variant="plain"
              aria-label="Action"
              onClick={props.onEdit}
            >
              <Icon size="lg">
                <EditIcon />
              </Icon>
            </PermittedButton>
          )}
        </>
      );
    default:
      return null;
  }
};
