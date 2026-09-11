import { Level, LevelItem, SearchInput, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import React, { ReactElement } from 'react';
import { translate as _ } from 'foremanReact/common/I18n';

interface VariablesTableToolbarProps {
  variableFilter: string;
  onVariableFilter: (filterString: string) => void;
}

export const VariablesTableToolbar = ({
  variableFilter,
  onVariableFilter,
}: VariablesTableToolbarProps): ReactElement => {

  return (
    <Level hasGutter>
      <LevelItem>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <SearchInput
                style={{ width: '20vw' }}
                placeholder={_('Filter by variable name')}
                value={variableFilter}
                onChange={(_event, value) => onVariableFilter(value)}
              />
            </ToolbarItem>
            <ToolbarItem variant="separator" />
          </ToolbarContent>
        </Toolbar>
      </LevelItem>
    </Level>
  );
};
