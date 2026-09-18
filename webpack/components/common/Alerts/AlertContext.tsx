import React, {
  createContext,
  useState,
  useCallback,
  ReactElement,
} from 'react';
import {
  Modal,
  Button,
  ModalVariant,
  Alert,
  CodeBlock,
  CodeBlockCode,
  Stack,
  StackItem,
  Grid,
  GridItem,
  Label,
  Text,
  TextContent,
  TextVariants, EmptyState, EmptyStateHeader, EmptyStateIcon, EmptyStateVariant, EmptyStateBody,
} from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';
import {
  InnerScrollContainer,
  OuterScrollContainer,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import ResourcesEmptyIcon from '@patternfly/react-icons/dist/esm/icons/resources-empty-icon';
import { AnsibleDirectorIssue } from '../../../types/issues/types';

interface AlertContextType {
  showAlert: (issues: AnsibleDirectorIssue[]) => void;
  hideAlert: () => void;
}

export const AlertContext = createContext<AlertContextType | undefined>(
  undefined
);

interface AlertModalProviderProps {
  children: React.ReactNode;
}

export const AlertModalProvider = ({
  children,
}: AlertModalProviderProps): ReactElement => {
  const [allIssues, setAllIssues] = useState<AnsibleDirectorIssue[]>([]);
  const [
    selectedIssueIdx,
    setSelectedIssueIdx,
  ] = useState<number | null>(null);

  const hideAlert = useCallback(() => {
    setSelectedIssueIdx(null);
    setAllIssues([]);
  }, []);

  const showAlertModal = useCallback((issues: AnsibleDirectorIssue[]) => {
    setSelectedIssueIdx(null);
    setAllIssues(issues);
  }, []);

  const renderModal = (): ReactElement | null => {
    if (!allIssues.length) return null;

    return (
      <Modal
        variant={ModalVariant.large}
        title={_('Issues occurred during the previous operation')}
        isOpen
        onClose={hideAlert}
        actions={[
          <Button key="dismiss" variant="primary" onClick={hideAlert}>
            {_('Dismiss')}
          </Button>,
        ]}
      >
        <Grid hasGutter>
          <GridItem span={5}>
            <OuterScrollContainer>
              <InnerScrollContainer>
                <Table variant="compact" isStickyHeader>
                  <Thead>
                    <Tr>
                      <Th modifier="nowrap" width={30}>
                        {_('Issue')}
                      </Th>
                      <Th width={10}>{_('Type')}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {allIssues.map((issue, index) => (
                      <Tr
                        key={index}
                        onRowClick={() => {
                          setSelectedIssueIdx(index);
                        }}
                        isSelectable
                        isClickable
                        isRowSelected={selectedIssueIdx === index}
                      >
                        <Td dataLabel={_('Issue')} modifier="breakWord">
                          <TextContent>
                            <Text component={TextVariants.h6}>
                              {issue.title}
                            </Text>
                          </TextContent>
                        </Td>
                        <Td dataLabel={_('Type')}>
                          <Label
                            variant="filled"
                            color={issue.type === 'error' ? 'red' : 'orange'}
                          >
                            {issue.type.toUpperCase()}
                          </Label>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </InnerScrollContainer>
            </OuterScrollContainer>
          </GridItem>
          <GridItem span={7}>
            {selectedIssueIdx !== null ? (
              <Stack hasGutter>
                <StackItem>
                  <Alert
                    variant={allIssues[selectedIssueIdx].type == 'error' ? 'danger' : 'warning'}
                    title={allIssues[selectedIssueIdx].title}
                    ouiaId="AlertModalAlert"
                    isInline
                    style={{ width: '100%' }}
                  />
                </StackItem>
                <StackItem>
                  <CodeBlock style={{ width: '100%' }}>
                    <CodeBlockCode id="code-content">
                      {allIssues[selectedIssueIdx].message}
                    </CodeBlockCode>
                  </CodeBlock>
                </StackItem>
              </Stack>
            ) : (
              <EmptyState variant={EmptyStateVariant.lg}>
                <EmptyStateHeader
                  headingLevel="h4"
                  titleText={_('No issue selected')}
                  icon={<EmptyStateIcon icon={ResourcesEmptyIcon} />}
                />
                <EmptyStateBody>
                  {_('Select and issue to view details')}
                </EmptyStateBody>
              </EmptyState>
            )}
          </GridItem>
        </Grid>
      </Modal>
    );
  };

  return (
    <AlertContext.Provider value={{ showAlert: showAlertModal, hideAlert }}>
      {children}
      {renderModal()}
    </AlertContext.Provider>
  );
};
