import React from 'react';
import { Modal, ModalVariant, Button } from '@patternfly/react-core';
import { ContentUnitSelectorWrapper } from './components/ContentUnitSelectorWrapper';

export const ContentUnitModal: React.FunctionComponent = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(true);

  const handleModalToggle = (_event: KeyboardEvent | React.MouseEvent) => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <React.Fragment>
      <Modal
        variant={ModalVariant.medium}
        title="Medium modal"
        isOpen={isModalOpen}
        onClose={handleModalToggle}
        actions={[
          <Button key="confirm" variant="primary" onClick={handleModalToggle}>
            Confirm
          </Button>,
          <Button key="cancel" variant="link" onClick={handleModalToggle}>
            Cancel
          </Button>,
        ]}
      >
        <ContentUnitSelectorWrapper />
      </Modal>
    </React.Fragment>
  );
};
