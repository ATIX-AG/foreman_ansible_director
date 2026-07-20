import React, { ReactElement, useContext } from 'react';
import { foremanUrl } from 'foremanReact/common/helpers';
import { translate as _ } from 'foremanReact/common/I18n';

import {
  Button,
  Flex,
  FlexItem,
  Level,
  LevelItem,
  SearchInput,
  Tab,
  Tabs,
  TextContent,
  Text,
  TextVariants,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Bullseye,
  EmptyStateFooter,
  EmptyStateActions,
} from '@patternfly/react-core';

import ClusterIcon from '@patternfly/react-icons/dist/esm/icons/cluster-icon';
import ObjectGroupIcon from '@patternfly/react-icons/dist/esm/icons/object-group-icon';
import ExternalLinkSquareAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-square-alt-icon';
import ResourcesEmptyIcon from '@patternfly/react-icons/dist/esm/icons/resources-empty-icon';

import { AdPermissions } from '../../../constants/foremanAnsibleDirectorPermissions';

import { ContentAssignmentTable } from './components/ContentAssignmentTable';
import {
  AnsibleContentAssignment,
  ContentResolutionNode,
  ContentResolutionNodeType,
  ResolvedAssignment,
} from '../../../types/AnsibleContentAssignmentTypes';
import { HierarchyLevelSelector } from './components/HierarchyLevelSelector';
import { AlertModal } from '../AlertModal';
import { assignmentFqrn, crnTypeMatcherMap } from './helpers';
import { AssignmentSelectorWrapper } from './components/AssignmentSelectorWrapper';
import { ResolutionWarning } from '../../../types/issues/warnings';
import { Permitted } from '../Permitted';
import { AssignmentContext } from './AssignmentContext';
import { OverrideGridWrapper } from './components/Variables/OverrideGridWrapper';

interface AnsibleContentAssignmentCompProps {
  crnId: number;
  crnType: ContentResolutionNodeType;
  crnName: string;
  csId: number;
  hierarchy: ContentResolutionNode[];
  assignments: ResolvedAssignment<AnsibleContentAssignment>[];
  resolutionWarnings: ResolutionWarning[];
}

const hierarchyIconMap: Record<ContentResolutionNodeType, ReactElement> = {
  Host: <ClusterIcon />,
  Hostgroup: <ObjectGroupIcon />,
};

export const AnsibleContentAssignmentComp = ({
  crnId,
  crnType,
  crnName,
  csId,
  hierarchy,
  assignments,
  resolutionWarnings,
}: AnsibleContentAssignmentCompProps): ReactElement | null => {
  const [
    selectedAlert,
    setSelectedAlert,
  ] = React.useState<ResolutionWarning | null>(null);

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = React.useState<
    boolean
  >(false);
  const [activeTabKey, setActiveTabKey] = React.useState<number>(0);

  const [fqrnFilter, setFqrnFilter] = React.useState<string>('');

  const assignmentCtx = useContext(AssignmentContext);

  if (assignmentCtx === null) {
    return null;
  }

  const [selectedHierarchyNode, setSelectedHierarchyNode] = React.useState<
    ContentResolutionNode
  >({
    type: crnType,
    id: crnId,
    name: crnName,
  });

  const filteredAssignments = (): ResolvedAssignment<
    AnsibleContentAssignment
  >[] => {
    const endIndex = hierarchy.findIndex(
      node =>
        node.type === selectedHierarchyNode.type &&
        node.id === selectedHierarchyNode.id
    );

    const relevantNodes = hierarchy.slice(0, endIndex + 1);

    let filtered: Array<ResolvedAssignment<AnsibleContentAssignment>> = [];

    relevantNodes.forEach(hierarchyNode => {
      filtered = [
        ...assignments.filter(
          assignment =>
            assignment.consumable_type === hierarchyNode.type &&
            assignment.consumable_id === hierarchyNode.id
        ),
        ...filtered,
      ].filter(assignment =>
        assignmentFqrn(assignment).includes(fqrnFilter.toLowerCase()));
    });

    return filtered;
  };

  const mainContent = (): ReactElement => {
    const filtered = filteredAssignments();

    if (filtered.length > 0) {
      return (
        <ContentAssignmentTable
          crnType={crnType}
          crnId={crnId}
          assignments={filteredAssignments()}
          hierarchyIconMap={hierarchyIconMap}
          hierarchy={hierarchy}
          onBadAssignmentClick={assignment => {
            const warning = resolutionWarnings.find(
              w => w.assignment_id === assignment.id
            );
            setSelectedAlert(warning === undefined ? null : warning);
          }}
          onAssignmentRemove={async assignment => {
            await assignmentCtx.handleAssignmentDestroy(assignment);
            assignmentCtx.dataInterface === 'api'
              ? assignmentCtx.refreshAssignments()
              : setIsAssignmentModalOpen(false);
          }}
        />
      );
    }
    return (
      <Bullseye>
        <EmptyState>
          <EmptyStateHeader
            titleText={
              assignments.length > 0
                ? _(
                  'No content found for these filters. Clear all filters and try again.'
                )
                : _(`No content assigned to this ${crnType}.`)
            }
            headingLevel="h1"
            icon={<EmptyStateIcon icon={ResourcesEmptyIcon} />}
          />
          {assignments.length > 0 ? (
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button
                  variant="link"
                  onClick={() => {
                    setSelectedHierarchyNode({
                      type: crnType,
                      id: crnId,
                      name: crnName,
                    });
                    setFqrnFilter('');
                  }}
                >
                  {_('Clear all filters')}
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          ) : null}
        </EmptyState>
      </Bullseye>
    );
  };

  return (
    <Tabs
      activeKey={activeTabKey}
      onSelect={(_event, eventKey) => setActiveTabKey(eventKey as number)}
      isBox
      isFilled
    >
      <Tab title={_('Ansible content')} eventKey={0}>
        <Permitted
          requiredPermissions={[
            AdPermissions.assignments.view,
            AdPermissions.assignments.create,
            AdPermissions.assignments.destroy,
          ]}
        >
          <div style={{ padding: '16px' }}>
            <Flex direction={{ default: 'column' }}>
              <FlexItem>
                <Level>
                  <LevelItem>
                    <>
                      <TextContent
                        style={{
                          display: 'inline-block',
                        }}
                      >
                        <Text component={TextVariants.h3} style={{}}>
                          {_('Content source:')}
                        </Text>
                      </TextContent>
                      <Button
                        variant="link"
                        icon={<ExternalLinkSquareAltIcon />}
                        iconPosition="end"
                        onClick={() => {
                          window.open(foremanUrl('/ansible/environments'));
                        }}
                      >
                        {_('Lifecycle Environment')}
                      </Button>
                    </>
                  </LevelItem>
                  <LevelItem>
                    <>
                      <TextContent
                        style={{
                          display: 'inline-block',
                          paddingRight: '16px',
                        }}
                      >
                        <Text component={TextVariants.h3}>
                          {_('Inheritance hierarchy:')}
                        </Text>
                      </TextContent>
                      <HierarchyLevelSelector
                        hierarchy={hierarchy}
                        hierarchyIconMap={hierarchyIconMap}
                        onSelect={crn => setSelectedHierarchyNode(crn)}
                        selected={selectedHierarchyNode}
                      />
                    </>
                  </LevelItem>
                  <LevelItem>
                    <Toolbar>
                      <ToolbarContent>
                        <ToolbarItem>
                          <SearchInput
                            style={{ width: '20vw' }}
                            placeholder={_('Filter by name')}
                            value={fqrnFilter}
                            onChange={(_event, value) => setFqrnFilter(value)}
                          />
                        </ToolbarItem>
                        <ToolbarItem variant="separator" />
                        <ToolbarItem>
                          <Button
                            variant="primary"
                            onClick={() => setIsAssignmentModalOpen(true)}
                          >
                            {_('Assign content')}
                          </Button>
                        </ToolbarItem>
                      </ToolbarContent>
                    </Toolbar>
                  </LevelItem>
                </Level>
              </FlexItem>
              <FlexItem>{mainContent()}</FlexItem>
            </Flex>
            {selectedAlert !== null && (
              <AlertModal
                variant="warning"
                isOpen
                onClose={() => setSelectedAlert(null)}
                title={selectedAlert.title}
                message={selectedAlert.message}
              />
            )}
            {isAssignmentModalOpen && (
              <AssignmentSelectorWrapper
                crnType={crnType}
                csId={csId}
                onClose={() => setIsAssignmentModalOpen(false)}
                onAbort={() => setIsAssignmentModalOpen(false)}
                onSuccess={assignmentCtx.dataInterface === 'api' ? () => {
                  assignmentCtx.refreshAssignments();
                  setIsAssignmentModalOpen(false);
                } : () => {
                  setIsAssignmentModalOpen(false);
                }}
              />
            )}
          </div>
        </Permitted>
      </Tab>
      {
        assignmentCtx.dataInterface === 'api' && (
          <Tab title={_('Ansible variables')} eventKey={1}>
            <OverrideGridWrapper
              crnType={crnType}
              crnId={crnId}
              matcherType={crnTypeMatcherMap[crnType]}
              matcherName={crnName}
            />
          </Tab>
        )
      }
    </Tabs>
  );
};
