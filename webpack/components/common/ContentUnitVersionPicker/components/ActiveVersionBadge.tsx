import React, { ReactElement } from 'react';
import { Label } from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';
import TagIcon from '@patternfly/react-icons/dist/esm/icons/tag-icon';

interface ActiveVersionBadgeProps {
  activeVersion: string | null;
  onClear: () => void;
}

export const ActiveVersionBadge = ({
  activeVersion,
  onClear,
}: ActiveVersionBadgeProps): ReactElement => {

  return (
    <Label
      color={activeVersion !== null ? 'blue' : 'grey'}
      variant="filled"
      onClose={activeVersion === null ? undefined : onClear}
      icon={<TagIcon />}
    >
      {activeVersion ?? _('No version')}
    </Label>
  );
};
