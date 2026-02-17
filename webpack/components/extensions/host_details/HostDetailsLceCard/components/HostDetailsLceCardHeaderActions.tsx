import { Icon, ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import SaveIcon from '@patternfly/react-icons/dist/esm/icons/save-icon';
import EditIcon from '@patternfly/react-icons/dist/esm/icons/edit-icon';
import CatalogIcon from '@patternfly/react-icons/dist/esm/icons/catalog-icon';
import BundleIcon from '@patternfly/react-icons/dist/esm/icons/bundle-icon';

import { translate as _ } from 'foremanReact/common/I18n';

import React from 'react';
import { PermittedButton } from '../../../../common/PermittedButton';
import { AdPermissions } from '../../../../../constants/foremanAnsibleDirectorPermissions';

interface HostDetailsLceCardHeaderActionsProps {
  isEditMode: boolean;
  handleEdit: () => void;
  isUsingLibrary: boolean;
  handleContentSourceSet: () => void;
}

export const HostDetailsLceCardHeaderActions: React.FC<HostDetailsLceCardHeaderActionsProps> = ({
  isEditMode,
  handleEdit,
  isUsingLibrary,
  handleContentSourceSet,
}) => (
  <>
    <ToggleGroup
      areAllGroupsDisabled={false}
      aria-label="Default with multiple selectable"
    >
      <ToggleGroupItem
        icon={isUsingLibrary ? <CatalogIcon /> : <BundleIcon />}
        text={isUsingLibrary ? _('Library') : _('Lifecycle environment')}
        key={0}
        buttonId="toggle-group-multiple-1"
        isSelected={isUsingLibrary}
        onChange={() => handleContentSourceSet()}
      />
    </ToggleGroup>
    {!isUsingLibrary && (
      <PermittedButton
        requiredPermissions={[AdPermissions.assignments.create]}
        hasPopover
        popoverProps={{
          triggerAction: 'hover',
          'aria-label': 'edit host lce popover',
          headerComponent: 'h1',
          headerContent: _('Assign lifecycle environment'),
          bodyContent: (
            <div>{_('Set the lifecycle environment of this host.')}</div>
          ),
        }}
        variant="plain"
        aria-label="Action"
        onClick={handleEdit}
      >
        {isEditMode ? (
          <Icon size="lg">
            <SaveIcon />
          </Icon>
        ) : (
          <Icon size="lg">
            <EditIcon />
          </Icon>
        )}
      </PermittedButton>
    )}
  </>
);
