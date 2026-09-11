import React, { ReactElement } from 'react';
import { Table, Thead, Tr, Th, Tbody, Td, ExpandableRowContent } from '@patternfly/react-table';
import {
  BoundAnsibleVariable,
  WithResolvedVariables,
} from '../../../../../../types/AnsibleVariableTypes';
import { AnsibleContentAssignment, ContentResolutionNode } from '../../../../../../types/AnsibleContentAssignmentTypes';
import { assignmentFqrn } from '../../../helpers';
import { VariablesTable } from './VariablesTable';
import { BindingDetailModalWrapper } from './BindingDetailModalWrapper';

interface VariablesTableProps {
  assignmentsWithVariables: WithResolvedVariables<AnsibleContentAssignment>[];
  resolutionHierarchy: ContentResolutionNode[];
  fqrnFilter: string;
}

export const VariablesAssignmentTable = ({
  assignmentsWithVariables,
  resolutionHierarchy,
  fqrnFilter }: VariablesTableProps): ReactElement => {

  const columnNames = {
    fqrn: 'FQRN',
  };

  const [selectedVariable, setSelectedVariable] = React.useState<BoundAnsibleVariable | null>(null);
  const [selectedAssignment, setSelectedAssignment] = React.useState<AnsibleContentAssignment | null>(null);

  const [expandedAssignments, setExpandedAssignments] = React.useState<string[]>([]);
  const setAssignmentExpanded = (assignment: AnsibleContentAssignment, isExpanding = true): void =>
    setExpandedAssignments(prevExpanded => {
      const fqrn = assignmentFqrn(assignment);
      const expanded = prevExpanded.filter(f => f !== fqrn);
      return isExpanding
        ? [...expanded, fqrn]
        : expanded;
    });

  const isAssignmentExpanded = (assignment: AnsibleContentAssignment): boolean =>
    expandedAssignments.includes(assignmentFqrn(assignment));

  return (
    <>
      <Table aria-label="Simple table">
        <Thead>
          <Tr>
            <Th screenReaderText="Row expansion" />
            <Th width={20}>{columnNames.fqrn}</Th>
          </Tr>
        </Thead>
        {assignmentsWithVariables.filter(a => assignmentFqrn(a).includes(fqrnFilter)).map((assignment, rowIndex) => {

          const fqrn = assignmentFqrn(assignment);

          return (
            <Tbody key={fqrn} isExpanded={isAssignmentExpanded(assignment)}>
              <Tr>
                <Td
                  expand={
                    {
                      rowIndex,
                      isExpanded: isAssignmentExpanded(assignment),
                      onToggle: () => setAssignmentExpanded(assignment, !isAssignmentExpanded(assignment)),
                      expandId: 'composable-nested-table-expandable-example',
                    }
                  }
                />
                <Td dataLabel={columnNames.fqrn}>{fqrn}</Td>
              </Tr>
              <Tr isExpanded={isAssignmentExpanded(assignment)}>
                <Td
                  dataLabel={'expended'}
                  colSpan={Object.keys(columnNames).length + 1}
                >
                  <ExpandableRowContent>
                    {<VariablesTable
                      variables={assignment.variables}
                      resolutionHierarchy={resolutionHierarchy}
                      onItemClick={variable => {
                        setSelectedVariable(variable);
                        setSelectedAssignment(assignment);
                      }}
                    />}
                  </ExpandableRowContent>
                </Td>
              </Tr>
            </Tbody>
          );
        })}
      </Table>
      {selectedVariable !== null && selectedAssignment !== null && (
        <BindingDetailModalWrapper
          variable={selectedVariable}
          assignment={selectedAssignment}
          onClose={() => {
            setSelectedAssignment(null);
            setSelectedVariable(null);
          }}
        />
      )}
    </>
  );
};
