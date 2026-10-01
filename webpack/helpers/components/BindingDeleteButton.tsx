import React, { ReactElement } from 'react';
import { Button, Tooltip } from '@patternfly/react-core';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import { sprintf as __, translate as _ } from 'foremanReact/common/I18n';
import { AnsibleVariableBinding as AnsibleVariableBindingType } from '../../types/AnsibleVariableTypes';
import { AnsibleVariableBinding as AnsibleVariableBindingClient } from '../../resources/clients/AnsibleVariableBinding';
import { crnTypeUiString } from '../../components/common/AnsibleContentAssignment/helpers';
import { ConfirmableAction, ConfirmationModal } from './ConfirmationModal';
import { useToasts } from '../toasts/useToasts';

interface BindingDeleteButtonProps {
  // Binding to delete. Pass `null` when there is nothing to delete yet
  // (e.g. the variable isn't bound); the button will render disabled.
  binding: AnsibleVariableBindingType | null;
  variableName: string;
  onDeleted: () => void;
  tooltipText?: string;
  isDisabled?: boolean;
}

// Reusable "delete binding" action: a trash icon button that, once confirmed,
// destroys the given binding via the API and reports success upstream.
export const BindingDeleteButton = ({
  binding,
  variableName,
  onDeleted,
  tooltipText,
  isDisabled,
}: BindingDeleteButtonProps): ReactElement => {
  const { withToast } = useToasts();
  const [confirmableAction, setConfirmableAction] = React.useState<ConfirmableAction | null>(null);

  const label = tooltipText ?? _('Delete binding');
  const disabled = isDisabled ?? binding === null;

  return (
    <>
      <Tooltip content={label}>
        <Button
          variant="plain"
          aria-label={label}
          icon={<TrashIcon />}
          isDisabled={disabled}
          onClick={() => {
            if (binding === null) {
              return;
            }

            setConfirmableAction({
              title: _('Delete binding?'),
              body: __(_('Delete binding of variable %(variableName)s to %(nodeType)s %(nodeName)s?'), {
                variableName,
                nodeType: crnTypeUiString[binding.consumable_type],
                nodeName: binding.consumable_name,
              }),
              onAbort: () => setConfirmableAction(null),
              onConfirm: async () => {
                await withToast({
                  type: 'delete',
                  resource: 'ansible_variable_binding',
                  func: AnsibleVariableBindingClient.destroy(binding.id),
                });
                setConfirmableAction(null);
                onDeleted();
              },
            });
          }}
        />
      </Tooltip>
      {confirmableAction !== null && (
        <ConfirmationModal
          isConfirmationModalOpen
          title={confirmableAction.title}
          body={confirmableAction.body}
          onConfirm={confirmableAction.onConfirm}
          onAbort={confirmableAction.onAbort}
        />
      )}
    </>
  );
};
