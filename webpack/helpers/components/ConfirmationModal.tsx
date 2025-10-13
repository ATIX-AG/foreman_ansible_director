import React, { Dispatch, ReactElement, SetStateAction } from 'react';
import { Modal, ModalVariant, Button } from '@patternfly/react-core';

interface ConfirmationModalProps {
  isConfirmationModalOpen: boolean;
  setIsConfirmationModalOpen: Dispatch<SetStateAction<boolean>>;
  title: string;
  body: string;
  onConfirm: () => void;
  onAbort?: () => void;
}

export const ConfirmationModal = ({
  isConfirmationModalOpen,
  setIsConfirmationModalOpen,
  title,
  body,
  onConfirm,
  onAbort,
}: ConfirmationModalProps): ReactElement => {
  const [isConfirmButtonSpinning, setIsConfirmButtonSpinning] = React.useState<
    boolean
  >(false);

  return (
    <Modal
      variant={ModalVariant.small}
      title={title}
      isOpen={isConfirmationModalOpen}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          onClick={async () => {
            setIsConfirmButtonSpinning(true);
            onConfirm();
            setIsConfirmButtonSpinning(false);
            setIsConfirmationModalOpen(false);
          }}
          isLoading={isConfirmButtonSpinning}
        >
          Confirm
        </Button>,
        <Button
          key="cancel"
          variant="link"
          onClick={onAbort || (() => setIsConfirmationModalOpen(false))}
        >
          Cancel
        </Button>,
      ]}
    >
      {body}
    </Modal>
  );
};
