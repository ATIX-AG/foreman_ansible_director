import React, { ReactElement } from 'react';
import { List, Panel, PanelMain, PanelMainBody } from '@patternfly/react-core';
import { AnsibleContentUnit } from '../../../types/AnsibleContentTypes';
import { ContentUnitRow } from './components/ContentUnitRow';
import { SelectionMapWorkingObject } from './ContentUnitVersionPickerModal';

interface ContentUnitVersionPickerProps {
  availableContentUnits: AnsibleContentUnit[];
  selectedContent: Record<number, SelectionMapWorkingObject>;
  onVersionSelect: (cuId: number, cuvId: number) => void;
  onVersionClear: (cuId: number) => void;
  onRevertClick: (cuId: number) => void;
}

export const ContentUnitVersionPicker = ({
  availableContentUnits,
  selectedContent,
  onVersionSelect,
  onVersionClear,
  onRevertClick,
}: ContentUnitVersionPickerProps): ReactElement => {

  return (
    <div style={{ maxHeight: '60vh' }}>
      <Panel isScrollable>
        <PanelMain tabIndex={0} maxHeight={'60vh'}>
          <PanelMainBody>
            <List isPlain isBordered>
              {availableContentUnits.map(cu => (<ContentUnitRow
                contentUnit={cu}
                selectedContent={selectedContent}
                onVersionSelect={onVersionSelect}
                onClear={onVersionClear}
                onRevertClick={() => onRevertClick(cu.id)}
              />))}
            </List>
          </PanelMainBody>
        </PanelMain>
      </Panel>
    </div>
  );
};
