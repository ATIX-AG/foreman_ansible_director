import React, { ReactElement } from 'react';
import {
  Modal,
  Button,
  ModalVariant,
  Alert,
  CodeBlock,
  CodeBlockCode,
} from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';
import { pfAlertVariant } from '../../types/common';

interface AlertModalProps {
  variant: pfAlertVariant;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export const AlertModal = ({
  variant,
  isOpen,
  onClose,
  message,
  title,
}: AlertModalProps): ReactElement => (
  <>
    <Modal
      variant={ModalVariant.medium}
      title={
        <Alert
          variant={variant}
          title={title}
          ouiaId="AlertModalAlert"
          isInline
        />
      }
      isOpen={isOpen}
      onClose={onClose}
      actions={[
        <Button key="ok" variant="primary" onClick={onClose}>
          {_('OK')}
        </Button>,
      ]}
    >
      <CodeBlock>
        <CodeBlockCode id="code-content">{message}</CodeBlockCode>
      </CodeBlock>
    </Modal>
  </>
);
