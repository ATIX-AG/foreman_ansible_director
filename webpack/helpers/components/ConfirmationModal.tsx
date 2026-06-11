import React, { ReactElement, useEffect, useRef } from 'react';
import { Modal, ModalVariant, Button } from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';

interface ConfirmationModalProps {
  isConfirmationModalOpen: boolean;
  title: string;
  body: string;
  onConfirm: () => void | Promise<void>;
  onAbort: () => void;
}

export const ConfirmationModal = ({
  isConfirmationModalOpen,
  title,
  body,
  onConfirm,
  onAbort,
}: ConfirmationModalProps): ReactElement => {
  const [isConfirmButtonSpinning, setIsConfirmButtonSpinning] = React.useState<
    boolean
  >(false);

  const isMountedRef = useRef(true);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  return (
    <Modal
      aria-label={title}
      variant={ModalVariant.small}
      onClose={onAbort}
      title={title}
      isOpen={isConfirmationModalOpen}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          onClick={async () => {
            setIsConfirmButtonSpinning(true);
            await onConfirm();
            if (isMountedRef.current) {
              setIsConfirmButtonSpinning(false);
            }
          }}
          isLoading={isConfirmButtonSpinning}
        >
          {_('Confirm')}
        </Button>,
        <Button key="cancel" variant="link" onClick={onAbort}>
          {_('Cancel')}
        </Button>,
      ]}
    >
      {body}
    </Modal>
  );
};
