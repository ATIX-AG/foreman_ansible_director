import React, { Dispatch, ReactElement, SetStateAction } from 'react';
import {
  Form,
  FormGroup,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  MenuToggleElement,
} from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';

import { AnsibleLcePath } from '../../../../../types/AnsibleEnvironmentsTypes';

interface LcePathSelectorProps {
  lcePaths: AnsibleLcePath[];
  isEditMode: boolean;
  selectedLcePath: string | undefined;
  setSelectedLcePath: Dispatch<SetStateAction<string>>;
  selectedLce: string | undefined;
  setSelectedLce: Dispatch<SetStateAction<string>>;
}

export const LcePathSelector = ({
  lcePaths,
  isEditMode,
  selectedLcePath,
  setSelectedLcePath,
  selectedLce,
  setSelectedLce,
}: LcePathSelectorProps): React.ReactElement => {
  const LCE_PATH_SELECTOR_PLACEHOLDER = 'Lifecycle environment path';
  const [isLcePathToggleOpen, setIsLcePathToggleOpen] = React.useState<boolean>(
    false
  );
  const [isLceToggleOpen, setIsLceToggleOpen] = React.useState<boolean>(false);

  const lcePathSelectToggle = (
    toggleRef: React.Ref<MenuToggleElement>
  ): ReactElement => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsLcePathToggleOpen(!isLcePathToggleOpen)}
      isExpanded={isLcePathToggleOpen}
      isDisabled={!isEditMode}
      style={
        {
          width: '50%',
        } as React.CSSProperties
      }
    >
      {selectedLcePath}
    </MenuToggle>
  );

  const lceSelectToggle = (
    toggleRef: React.Ref<MenuToggleElement>
  ): ReactElement => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsLceToggleOpen(!isLcePathToggleOpen)}
      isExpanded={isLceToggleOpen}
      isDisabled={
        !isEditMode || selectedLcePath === LCE_PATH_SELECTOR_PLACEHOLDER
      }
      style={
        {
          width: '50%',
        } as React.CSSProperties
      }
    >
      {selectedLce}
    </MenuToggle>
  );
  return (
    <Form>
      <FormGroup label={_('Lifecycle environment path')}>
        <Select
          id="single-select"
          isOpen={isLcePathToggleOpen}
          selected={selectedLcePath}
          onSelect={(event?, value?) => {
            setSelectedLcePath(value as string);
            setIsLcePathToggleOpen(false);
          }}
          onOpenChange={() => {
            setIsLcePathToggleOpen(!isLcePathToggleOpen);
          }}
          toggle={lcePathSelectToggle}
          shouldFocusToggleOnSelect
        >
          <SelectList>
            {lcePaths.map(lcePath => (
              <SelectOption key={lcePath.id} value={lcePath.name}>
                {lcePath.name}
              </SelectOption>
            ))}
          </SelectList>
        </Select>
      </FormGroup>
      <FormGroup label={_('Lifecycle environment')}>
        <Select
          id="single-select"
          isOpen={isLceToggleOpen}
          selected={selectedLce}
          onSelect={(event?, value?) => {
            setSelectedLce(value as string);
            setIsLceToggleOpen(false);
          }}
          onOpenChange={() => {
            setIsLceToggleOpen(!isLceToggleOpen);
          }}
          toggle={lceSelectToggle}
          shouldFocusToggleOnSelect
        >
          {selectedLcePath !== LCE_PATH_SELECTOR_PLACEHOLDER && (
            <SelectList>
              {lcePaths
                .filter(lcePath => lcePath.name === selectedLcePath)[0]
                .lifecycle_environments.map(lce => (
                  <SelectOption key={lce.id} value={lce.name}>
                    {lce.name}
                  </SelectOption>
                ))}
            </SelectList>
          )}
        </Select>
      </FormGroup>
    </Form>
  );
};
