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

import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';
import axios, { AxiosResponse } from 'axios';
import { foremanUrl } from 'foremanReact/common/helpers';
import { addToast } from 'foremanReact/components/ToastsList';
import { useDispatch } from 'react-redux';
import { DefaultResponse, Task } from '../../../types/common';

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

  const dispatch = useDispatch();

  const handleTrigger = async (): Promise<void> => {
    setIsConfirmLoading(true);
    try {
      const triggeredTask: AxiosResponse<DefaultResponse<
        never,
        never,
        { task: Task }
      >> = await axios.post(
        foremanUrl(
          '/api/v2/ansible_director/ansible_content/consistency_check'
        ),
        {}
      );
      dispatch(
        addToast({
          type: 'success',
          key: 'CONSISTENCY_CHECK_SUCC',
          message: (
            <span>
              {_('Consistency check started!')}
              <br />
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={foremanUrl(
                  `/foreman_tasks/tasks/${triggeredTask.data.results.task.id}`
                )}
              >
                {_('View the task page for more details.')}
              </a>
            </span>
          ),
          sticky: false,
        })
      );
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: 'CONSISTENCY_CHECK_SUCC',
          message: __(
            _(
              'Triggering of consistency check failed with error code "%(error)s".'
            ),
            { error: (e as { response: AxiosResponse }).response.status }
          ),
          sticky: false,
        })
      );
    } finally {
      setIsConfirmLoading(false);
      onTriggered();
    }
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
