import { Level, LevelItem, SearchInput, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import React, { ReactElement } from 'react';
import { translate as _ } from 'foremanReact/common/I18n';

interface VariableAssignmentTableToolbarProps {
  fqrnFilter: string;
  onFqrnFilter: (filterString: string) => void;
}

export const VariableAssignmentTableToolbar = ({
  fqrnFilter,
  onFqrnFilter,
}: VariableAssignmentTableToolbarProps): ReactElement => {

  return (
    <Level hasGutter>
      <LevelItem>
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem>
              <SearchInput
                style={{ width: '20vw' }}
                placeholder={_('Filter by fully qualified role name')}
                value={fqrnFilter}
                onChange={(_event, value) => onFqrnFilter(value)}
              />
            </ToolbarItem>
            <ToolbarItem variant="separator" />
          </ToolbarContent>
        </Toolbar>
      </LevelItem>
    </Level>
  );
};
