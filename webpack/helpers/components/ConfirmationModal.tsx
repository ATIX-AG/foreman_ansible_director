import React from 'react';
import { Modal, ModalVariant, Button } from '@patternfly/react-core';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  body: string;
  onConfirm: () => void;
  onAbort: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  body,
  onConfirm,
  onAbort,
}) => (
  <Modal
    variant={ModalVariant.small}
    title={title}
    isOpen={isOpen}
    actions={[
      <Button key="confirm" variant="primary" onClick={onConfirm}>
        Confirm
      </Button>,
      <Button key="cancel" variant="link" onClick={onAbort}>
        Cancel
      </Button>,
    ]}
  >
    {body}
  </Modal>
);
