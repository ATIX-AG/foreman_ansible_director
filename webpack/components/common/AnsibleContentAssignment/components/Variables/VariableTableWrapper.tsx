import React, { ReactElement, useContext } from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import { VariableAssignmentTableToolbar } from './components/VariableAssignmentTableToolbar';
import { VariableContext } from './VariableContext';
import { VariablesAssignmentTable } from './components/VariablesAssignmentTable';

interface VariableTableWrapperProps {
}

export const VariableTableWrapper = ({ }: VariableTableWrapperProps): ReactElement | null => {

  const variablesCtx = useContext(VariableContext);

  if (variablesCtx === null) {
    return null;
  }

  const [fqrnFilter, setFqrnFilter] = React.useState<string>('');

  return (
    <>
      <Stack>
        <StackItem>
          <VariableAssignmentTableToolbar
            fqrnFilter={fqrnFilter}
            onFqrnFilter={filterString => setFqrnFilter(filterString)}
          />
        </StackItem>
        <StackItem>
          <VariablesAssignmentTable
            assignmentsWithVariables={variablesCtx.assignmentsWithVariables}
            resolutionHierarchy={variablesCtx.resolutionHierarchy}
            fqrnFilter={fqrnFilter}
          />
        </StackItem>
      </Stack>

    </>
  );

};
