import React, { Dispatch, SetStateAction, useEffect } from 'react';
import {
  DualListSelector,
  DualListSelectorPane,
  DualListSelectorList,
  DualListSelectorControlsWrapper,
  DualListSelectorControl,
  DualListSelectorTree,
  DualListSelectorTreeItemData,
  Button,
  EmptyState,
  EmptyStateVariant,
  EmptyStateHeader,
  EmptyStateFooter,
  EmptyStateBody,
  EmptyStateActions,
  EmptyStateIcon,
} from '@patternfly/react-core';
import AngleLeftIcon from '@patternfly/react-icons/dist/esm/icons/angle-left-icon';
import AngleRightIcon from '@patternfly/react-icons/dist/esm/icons/angle-right-icon';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import { Link, LinkProps } from 'react-router-dom';
import {
  AnsibleCollectionRole,
  FullAnsibleContentUnitAssignment,
} from '../../../../../types/AnsibleContentTypes';
import { unnamedAssignmentType } from './AssignmentComponentWrapper';

// TODO: Refactor this component. It's a mess
interface InnerLceAssignmentSelectorProps {
  data: FullAnsibleContentUnitAssignment[];
  assignedContent: unnamedAssignmentType;
  chosenUnits: {
    [unit: string]: { type: string; id: number }[];
  };
  setChosenUnits: Dispatch<
    SetStateAction<{ [unit: string]: { type: string; id: number }[] }>
  >;
  userCanManageAssignments: boolean;
}

interface LceAssignmentSelectorProps {
  contentUnits: FullAnsibleContentUnitAssignment[];
  assignedContent: unnamedAssignmentType;
  chosenUnits: {
    [unit: string]: { type: string; id: number }[];
  };
  setChosenUnits: Dispatch<
    SetStateAction<{ [unit: string]: { type: string; id: number }[] }>
  >;
  userCanManageAssignments: boolean;
}

interface ContentUnitTreeItemData extends DualListSelectorTreeItemData {
  parent: undefined | FullAnsibleContentUnitAssignment;
}

export const InnerLceAssignmentSelector = ({
  data,
  assignedContent,
  chosenUnits,
  setChosenUnits,
  userCanManageAssignments,
}: InnerLceAssignmentSelectorProps): React.ReactElement => {
  const [selectedRoles, setSelectedRoles] = React.useState<{
    [unit: string]: { type: string; id: number }[];
  }>({});

  const [availableUnits, setAvailableUnits] = React.useState<
    FullAnsibleContentUnitAssignment[]
  >([]);

  useEffect(() => {
    const initialChosenUnits: {
      [unit: string]: { type: string; id: number }[];
    } = {};

    if (assignedContent) {
      assignedContent.forEach(assignedContentUnit => {
        if (initialChosenUnits[assignedContentUnit.source_id] === undefined) {
          initialChosenUnits[assignedContentUnit.source_id] = [];
        }
        initialChosenUnits[assignedContentUnit.source_id].push({
          type: assignedContentUnit.source_type,
          id: assignedContentUnit.consumable_id,
        });
      });
      setChosenUnits({ ...initialChosenUnits });
    }
    setAvailableUnits(data);
    // This is intentional. setChosenUnits is also stable.
    // It will only change when the other two deps change.
    // If added, it causes an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedContent, data]);

  const moveChecked = (toChosen: boolean): void => {
    setChosenUnits(prevChosenUnits => {
      if (toChosen) {
        Object.keys(selectedRoles).forEach(selectedVersionKey => {
          prevChosenUnits[Number(selectedVersionKey)] =
            selectedRoles[Number(selectedVersionKey)];
        });
      } else {
        Object.keys(selectedRoles).forEach(selectedVersionKey => {
          delete prevChosenUnits[Number(selectedVersionKey)];
        });
      }
      setSelectedRoles({});
      return { ...prevChosenUnits };
    });
  };

  const onOptionCheck = (
    _event:
      | React.MouseEvent
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent,
    isChecked: boolean,
    node: ContentUnitTreeItemData
  ): void => {
    const roles = selectedRoles || {};
    if (node.parent) {
      if (isChecked) {
        const checkedRolesForVersion = roles[node.parent.id] || [];

        checkedRolesForVersion.push({
          type: node.parent.type,
          id: Number(node.id),
        });
        roles[node.parent.id] = checkedRolesForVersion;
      } else {
        const checkedRolesForVersion = roles[node.parent.id] || [];

        roles[node.parent.id] = checkedRolesForVersion.filter(
          role => role.id !== Number(node.id)
        );
      }
    }
    setSelectedRoles({ ...roles });
  };

  const buildACUOptions = (
    isChosen: boolean,
    [node, ...remainingNodes]: FullAnsibleContentUnitAssignment[],
    hasParentMatch: boolean
  ): ContentUnitTreeItemData[] => {
    if (!node) {
      return [];
    }

    const isChecked = selectedRoles
      ? selectedRoles[node.id] !== undefined &&
        selectedRoles[node.id].length > 0
      : false;
    const isDisplayed: boolean = isChosen
      ? Object.keys(chosenUnits).includes(String(node.id))
      : !Object.keys(chosenUnits).includes(String(node.id));

    const treeNode = {
      id: node.identifier,
      text: `${node.identifier}@${node.version}`,
      isChecked,
      parent: undefined,
      checkProps: { 'aria-label': `Select ${node.identifier}` },
      hasBadge: true,
      badgeProps: { isRead: true },
      defaultExpanded: false,
      ...(node.roles.length > 0 && {
        children: buildACROptions(isChosen, node, node.roles, hasParentMatch),
      }),
    };

    return [
      ...(isDisplayed ? [treeNode] : []),
      ...(remainingNodes
        ? buildACUOptions(isChosen, remainingNodes, hasParentMatch)
        : []),
    ];
  };

  const buildACROptions = (
    isChosen: boolean,
    parent: FullAnsibleContentUnitAssignment,
    [node, ...remainingNodes]: AnsibleCollectionRole[],
    hasParentMatch: boolean
  ): ContentUnitTreeItemData[] => {
    if (!node) {
      return [];
    }

    const isChecked =
      selectedRoles &&
      selectedRoles[parent.id] &&
      selectedRoles[parent.id].some(
        selectedRole => selectedRole.id === Number(node.id)
      );

    const isDisplayed: boolean = isChosen
      ? chosenUnits[parent.id] &&
        chosenUnits[parent.id].some(
          chosenRole => chosenRole.id === Number(node.id)
        )
      : true;

    const treeNode: ContentUnitTreeItemData = {
      id: node.id,
      text: node.name,
      isChecked,
      checkProps: { 'aria-label': `Select ${node.name}` },
      hasBadge: false,
      parent,
    };

    return [
      ...(isDisplayed ? [treeNode] : []),
      ...(remainingNodes
        ? buildACROptions(isChosen, parent, remainingNodes, hasParentMatch)
        : []),
    ];
  };

  const paneEmptyState = (
    <>
      <EmptyState variant={EmptyStateVariant.sm}>
        <EmptyStateHeader
          headingLevel="h4"
          titleText="No results found"
          icon={<EmptyStateIcon icon={SearchIcon} />}
        />
        <EmptyStateBody>
          No content here! Assign content or import some.
        </EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button
              variant="link"
              onClick={() => {}}
              component={(props: LinkProps) => (
                <Link {...props} to="/ansible/content" />
              )}
            >
              Import Ansible content
            </Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    </>
  );

  const buildPane = (isChosen: boolean): React.ReactNode => {
    const options: ContentUnitTreeItemData[] = buildACUOptions(
      isChosen,
      availableUnits,
      false
    );
    return (
      <DualListSelectorPane
        title={isChosen ? 'Chosen' : 'Available'}
        searchInput=""
        isChosen={isChosen}
        listMinHeight="300px"
      >
        {true && options.length === 0 && paneEmptyState}
        {/* This is for search support, which is not implemented yet. */}
        {options.length > 0 && (
          <DualListSelectorList>
            <DualListSelectorTree
              data={options}
              onOptionCheck={(e, isChecked, itemData) =>
                onOptionCheck(e, isChecked, itemData as ContentUnitTreeItemData)
              }
            />
          </DualListSelectorList>
        )}
      </DualListSelectorPane>
    );
  };

  return (
    <DualListSelector isTree>
      {buildPane(false)}
      <DualListSelectorControlsWrapper>
        <DualListSelectorControl
          isDisabled={
            Object.keys(selectedRoles).length === 0 || !userCanManageAssignments
          }
          onClick={() => moveChecked(true)}
          aria-label="Add selected"
        >
          <AngleRightIcon />
        </DualListSelectorControl>
        <DualListSelectorControl
          onClick={() => moveChecked(false)}
          isDisabled={
            Object.keys(selectedRoles).length === 0 || !userCanManageAssignments
          }
          aria-label="Remove selected"
        >
          <AngleLeftIcon />
        </DualListSelectorControl>
      </DualListSelectorControlsWrapper>
      {buildPane(true)}
    </DualListSelector>
  );
};

export const LceAssignmentSelector = ({
  contentUnits,
  assignedContent,
  chosenUnits,
  setChosenUnits,
  userCanManageAssignments,
}: LceAssignmentSelectorProps): React.ReactElement => (
  <InnerLceAssignmentSelector
    data={contentUnits}
    assignedContent={assignedContent}
    chosenUnits={chosenUnits}
    setChosenUnits={setChosenUnits}
    userCanManageAssignments={userCanManageAssignments}
  />
);
