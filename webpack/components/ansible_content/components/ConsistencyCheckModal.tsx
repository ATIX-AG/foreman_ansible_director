import React, { ReactElement } from 'react';
import {
  Alert,
  Button,
  Modal,
  ModalVariant,
  Stack,
  StackItem,
  Text,
  TextContent,
} from '@patternfly/react-core';

import { translate as _ } from 'foremanReact/common/I18n';
import { AnsibleContent } from '../../../resources/clients/AnsibleContent';
import { useToasts } from '../../../helpers/toasts/useToasts';

interface ConsistencyCheckModalProps {
  onAbort: () => void;
  onTriggered: () => void;
}

export const ConsistencyCheckModal = ({
  onAbort,
  onTriggered,
}: ConsistencyCheckModalProps): ReactElement => {
  const [isConfirmLoading, setIsConfirmLoading] = React.useState<boolean>(
    false
  );

  const { withToast } = useToasts();

  const handleTrigger = async (): Promise<void> => {
    setIsConfirmLoading(true);
    await withToast({
      type: 'task',
      func: AnsibleContent.consistencyCheck(),
    });
    setIsConfirmLoading(false);
    onTriggered();
  };

  return (
    <Modal
      isOpen
      variant={ModalVariant.large}
      title={_('Perform consistency check?')}
      onClose={() => onAbort()}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          onClick={() => handleTrigger()}
          isLoading={isConfirmLoading}
        >
          {_('Confirm')}
        </Button>,
        <Button key="cancel" variant="link" onClick={onAbort}>
          {_('Cancel')}
        </Button>,
      ]}
    >
      <Stack hasGutter>
        <StackItem>
          <TextContent>
            <Text component="p">
              {_(
                'Run a consistency check to clean up the database after a failed content import.'
              )}
            </Text>
          </TextContent>
        </StackItem>
        <StackItem>
          <Alert
            title={_(
              'Ensure no Ansible content import or synchronization jobs are running'
            )}
            variant="warning"
            isInline
          >
            <TextContent>
              <Text component="p">
                {_(
                  'This action causes Ansible content import actions to fail. Ensure no Ansible content import is running or started before starting the consistency check.'
                )}
              </Text>
            </TextContent>
          </Alert>
        </StackItem>
      </Stack>
    </Modal>
  );
};
