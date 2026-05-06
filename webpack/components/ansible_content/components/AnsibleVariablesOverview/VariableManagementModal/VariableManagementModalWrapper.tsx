import {
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Modal,
  ModalVariant,
  Spinner,
} from '@patternfly/react-core';
import React, { Dispatch, ReactElement, SetStateAction } from 'react';
import { useAPI, UseAPIReturn } from 'foremanReact/common/hooks/API/APIHooks';
import { translate as _ } from 'foremanReact/common/I18n';

import {
  AnsibleVariable,
  AnsibleVariableDetail,
} from '../../../../../types/AnsibleVariableTypes';
import { VariableManagementModalContent } from './VariableManagementModalContent';
import { BASE_VARIABLE_TAB_KEY } from './tabConstants';

interface VariableManagementModalWrapperProps {
  variable: AnsibleVariable;
  setSelectedVariable: Dispatch<SetStateAction<AnsibleVariable | undefined>>;
}

export const VariableManagementModalWrapper = ({
  variable,
  setSelectedVariable,
}: VariableManagementModalWrapperProps): ReactElement => {
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(
    BASE_VARIABLE_TAB_KEY
  );

  const modal = (title: string, modalContent: ReactElement): ReactElement => (
    <React.Fragment>
      <Modal
        style={{ minHeight: '500px' }}
        title={title}
        isOpen
        onClose={() => setSelectedVariable(undefined)}
        ouiaId="BasicModal"
        variant={ModalVariant.large}
      >
        {modalContent}
      </Modal>
    </React.Fragment>
  );

  const variableRequest: UseAPIReturn<AnsibleVariableDetail> = useAPI<
    AnsibleVariableDetail
  >('get', `/api/v2/ansible_director/ansible_variables/${variable.id}`);

  const refreshRequest = (): void => {
    variableRequest.setAPIOptions(options => ({ ...options }));
  };

  if (variableRequest.status === 'RESOLVED') {
    return modal(
      variableRequest.response.name,
      <VariableManagementModalContent
        originalVariable={variableRequest.response}
        setSelectedVariable={setSelectedVariable}
        refreshRequest={refreshRequest}
        activeTabKey={activeTabKey}
        setActiveTabKey={setActiveTabKey}
      />
    );
  } else if (variableRequest.status === 'ERROR') {
    // TODO: Handle request error
  }

  return modal(
    '',
    <EmptyState>
      <EmptyStateHeader
        titleText={_('Loading Ansible variable details...')}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={Spinner} />}
      />
    </EmptyState>
  );
};
