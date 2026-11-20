import React, { ReactElement } from 'react';
import UndoIcon from '@patternfly/react-icons/dist/esm/icons/undo-icon';
import { Label } from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';

interface RevertButtonProps {
  onRevertClick: () => void;
}

export const RevertButton = ({ onRevertClick }: RevertButtonProps): ReactElement => {
  return (
    <Label
      onClick={onRevertClick}
      icon={<UndoIcon />}
      color={'orange'}
    >
      {_('Revert')}
    </Label>
  );
};

