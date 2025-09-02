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
  AnsibleContentUnit,
  AnsibleContentUnitAssignment,
  AnsibleContentVersion,
} from '../../../../../types/AnsibleContentTypes';

interface InnerContentUnitSelectorProps {
  data: AnsibleContentUnit[];
  targetContentUnits: AnsibleContentUnitAssignment[];
  chosenUnits: {
    [unit: string]: string;
  };
  setChosenUnits: Dispatch<SetStateAction<{ [unit: string]: string }>>;
}

interface ContentUnitSelectorProps {
  contentUnits: AnsibleContentUnit[];
  targetContentUnits: AnsibleContentUnitAssignment[];
  chosenUnits: {
    [unit: string]: string;
  };
  setChosenUnits: Dispatch<SetStateAction<{ [unit: string]: string }>>;
}

interface ContentUnitTreeItemData extends DualListSelectorTreeItemData {
  parent: undefined | AnsibleContentUnit;
}

export const InnerContentUnitSelector: React.FC<InnerContentUnitSelectorProps> = ({
  data,
  targetContentUnits,
  chosenUnits,
  setChosenUnits,
}) => {
  const [selectedVersions, setSelectedVersions] = React.useState<{
    [unit: string]: string;
  }>({});

  const [availableUnits, setAvailableUnits] = React.useState<
    AnsibleContentUnit[]
  >([]);

  useEffect(() => {
    const newChosenUnits: { [unit: string]: string } = {};
    const newAvailableUnits: AnsibleContentUnit[] = [];

    targetContentUnits.forEach(targetUnit => {
      // TODO: This is not efficient for large content sets
      if (data.some(avUnit => avUnit.id === targetUnit.id)) {
        newChosenUnits[targetUnit.id] = targetUnit.version;
      } else {
        const newUnit = {
          type: targetUnit.type,
          identifier: targetUnit.identifier,
          versions: [
            {
              version: targetUnit.version,
            } as AnsibleContentVersion,
          ],
        } as AnsibleContentUnit;
        newAvailableUnits.push(newUnit);
        newChosenUnits[targetUnit.id] = targetUnit.version;
      }
    });
    if (Object.keys(newChosenUnits).length > 0) {
      setChosenUnits(newChosenUnits);
    }
    setAvailableUnits([...newAvailableUnits, ...data]);
  }, [data, setChosenUnits, targetContentUnits]);

  const moveChecked = (toChosen: boolean): void => {
    setChosenUnits(prevChosenUnits => {
      if (toChosen) {
        Object.keys(selectedVersions).forEach(selectedVersionKey => {
          prevChosenUnits[Number(selectedVersionKey)] =
            selectedVersions[Number(selectedVersionKey)];
        });
      } else {
        Object.keys(selectedVersions).forEach(selectedVersionKey => {
          delete prevChosenUnits[Number(selectedVersionKey)];
        });
      }
      setSelectedVersions({});
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
    const versions = selectedVersions || {};

    if (node.parent) {
      if (isChecked) {
        versions[node.parent.id] = node.text;
      } else {
        delete versions[node.parent.id];
      }
    } else if (!isChecked) {
      // If parent is undefined, the ACU was clicked
      // versions[node.id] = ''; // In that case node.text is the identifier
    }

    setSelectedVersions({ ...versions });
  };

  const buildACUOptions = (
    isChosen: boolean,
    [node, ...remainingNodes]: AnsibleContentUnit[],
    hasParentMatch: boolean
  ): ContentUnitTreeItemData[] => {
    if (!node) {
      return [];
    }

    const isChecked = selectedVersions
      ? selectedVersions[node.id] !== undefined
      : false;
    const isDisplayed: boolean = isChosen
      ? Object.keys(chosenUnits).includes(String(node.id))
      : !Object.keys(chosenUnits).includes(String(node.id));

    const treeNode = {
      id: node.identifier,
      text: node.identifier,
      isChecked,
      parent: undefined,
      checkProps: { 'aria-label': `Select ${node.identifier}` },
      hasBadge: true,
      badgeProps: { isRead: true },
      defaultExpanded: false,
      children: buildACVOptions(isChosen, node, node.versions, hasParentMatch),
    };

    return [
      ...(isDisplayed ? [treeNode] : []),
      ...(remainingNodes
        ? buildACUOptions(isChosen, remainingNodes, hasParentMatch)
        : []),
    ];
  };

  const buildACVOptions = (
    isChosen: boolean,
    parent: AnsibleContentUnit,
    [node, ...remainingNodes]: AnsibleContentVersion[],
    hasParentMatch: boolean
  ): ContentUnitTreeItemData[] => {
    if (!node) {
      return [];
    }

    const isChecked =
      selectedVersions && selectedVersions[parent.id] === node.version;

    const isDisplayed: boolean = isChosen
      ? chosenUnits[parent.id] === node.version
      : true;

    const treeNode = {
      id: node.version,
      text: node.version,
      isChecked,
      checkProps: { 'aria-label': `Select ${node.version}` },
      hasBadge: false,
      parent,
    };

    return [
      ...(isDisplayed ? [treeNode as ContentUnitTreeItemData] : []),
      ...(remainingNodes
        ? buildACVOptions(isChosen, parent, remainingNodes, hasParentMatch)
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
          isDisabled={Object.keys(selectedVersions).length === 0}
          onClick={() => moveChecked(true)}
          aria-label="Add selected"
        >
          <AngleRightIcon />
        </DualListSelectorControl>
        <DualListSelectorControl
          onClick={() => moveChecked(false)}
          isDisabled={Object.keys(selectedVersions).length === 0}
          aria-label="Remove selected"
        >
          <AngleLeftIcon />
        </DualListSelectorControl>
      </DualListSelectorControlsWrapper>
      {buildPane(true)}
    </DualListSelector>
  );
};

export const ContentUnitSelector: React.FC<ContentUnitSelectorProps> = ({
  contentUnits,
  targetContentUnits,
  chosenUnits,
  setChosenUnits,
}) => (
  <InnerContentUnitSelector
    data={contentUnits}
    targetContentUnits={targetContentUnits}
    chosenUnits={chosenUnits}
    setChosenUnits={setChosenUnits}
  />
);
