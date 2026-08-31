import React, { ReactElement } from 'react';
import { Alert, AlertActionLink } from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';
import { ContentResolutionNode } from '../../../../../../../types/AnsibleContentAssignmentTypes';
import { crnTypeUiString } from '../../../../helpers';

interface CrossNodeDisabledAlertVariableProps {
  variant: 'variable';
  crn?: never;
}
interface CrossNodeDisabledAlertBindingProps {
  variant: 'binding';
  crn: ContentResolutionNode;
}

type CrossNodeDisabledAlertProps = CrossNodeDisabledAlertBindingProps | CrossNodeDisabledAlertVariableProps;

export const CrossNodeDisabledAlert = ({
  variant,
  crn,
}: CrossNodeDisabledAlertProps): ReactElement => {

  return (
    <Alert
      title={_('Cross-node value editing disabled')}
      variant="warning"
      isInline
      actionLinks={
        <>
          <AlertActionLink component="a" href="#">
            {variant === 'variable' ? (
              _('Ansible > Ansible Content > Variables')
            ) : (_(`Configure > ${crnTypeUiString[crn.type]} > ${crn.name}`))}
          </AlertActionLink>
        </>
      }
    >
      {
        variant === 'variable'
          ? (_('Editing of variable defaults from consumers is disabled. Enable the "ansible_director_vars_cross_node_editing" setting or edit the default value on the Ansible Variables page.'))
          : (_('Editing of bindings not belonging to this consumer is disabled. Enable the "ansible_director_vars_cross_node_editing" setting or edit the value on the Ansible Director tab of the binding\'s owner.'))
      }

    </Alert>
  );
};
