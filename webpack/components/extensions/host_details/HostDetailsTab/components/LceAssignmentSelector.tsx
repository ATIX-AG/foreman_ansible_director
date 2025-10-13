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
  AnsibleContentUnit,
  AnsibleContentUnitAssignment,
  AnsibleContentUnitFull,
  AnsibleContentVersion,
  AnsibleContentVersionFull,
} from '../../../../../types/AnsibleContentTypes';

interface InnerContentUnitSelectorProps {
  data: AnsibleContentUnitFull[];
  targetContentUnits: AnsibleContentUnitAssignment[];
  chosenUnits: {
    [unit: string]: string[];
  };
  setChosenUnits: Dispatch<SetStateAction<{ [unit: string]: string[] }>>;
}

interface ContentUnitSelectorProps {
  contentUnits: AnsibleContentUnitFull[];
  targetContentUnits: AnsibleContentUnitAssignment[];
  chosenUnits: {
    [unit: string]: string[];
  };
  setChosenUnits: Dispatch<SetStateAction<{ [unit: string]: string[] }>>;
}

interface ContentUnitTreeItemData extends DualListSelectorTreeItemData {
  parent: undefined | AnsibleContentUnitFull;
}

export const InnerContentUnitSelector: React.FC<InnerContentUnitSelectorProps> = ({
  data,
  targetContentUnits,
  chosenUnits,
  setChosenUnits,
}) => {
  const [selectedRoles, setSelectedRoles] = React.useState<{
    [unit: string]: string[];
  }>({});

  const [availableUnits, setAvailableUnits] = React.useState<
    AnsibleContentUnitFull[]
  >([]);

  useEffect(() => {
    setAvailableUnits(data);
  }, [data]);

  // useEffect(() => {
  //  const newChosenUnits: { [unit: string]: string } = {};
  //  const newAvailableUnits: AnsibleContentUnitFull[] = [];
  //
  //  targetContentUnits.forEach(targetUnit => {
  //    // TODO: This is not efficient for large content sets
  //    if (data.some(avUnit => avUnit.id === targetUnit.id)) {
  //      newChosenUnits[targetUnit.id] = targetUnit.version;
  //    } else {
  //      const newUnit = {
  //        type: targetUnit.type,
  //        identifier: targetUnit.identifier,
  //        versions: [
  //          {
  //            version: targetUnit.version,
  //          } as AnsibleContentVersionFull,
  //        ],
  //      } as AnsibleContentUnitFull;
  //      newAvailableUnits.push(newUnit);
  //      newChosenUnits[targetUnit.id] = targetUnit.version;
  //    }
  //  });
  //  if (Object.keys(newChosenUnits).length > 0) {
  //    setChosenUnits(newChosenUnits);
  //  }
  //  setAvailableUnits([...newAvailableUnits, ...data]);
  // }, [data, setChosenUnits, targetContentUnits]);

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
    console.log(isChecked, node);
    const roles = selectedRoles || {};
    if (node.parent) {
      if (isChecked) {
        const checkedRolesForVersion = roles[node.parent.id] || [];

        checkedRolesForVersion.push(node.text);
        roles[node.parent.id] = checkedRolesForVersion;
      } else {
        const checkedRolesForVersion = roles[node.parent.id] || [];

        roles[node.parent.id] = checkedRolesForVersion.filter(
          role => role !== node.text
        );
      }
    }
    setSelectedRoles({ ...roles });
  };

  const buildACUOptions = (
    isChosen: boolean,
    [node, ...remainingNodes]: AnsibleContentUnitFull[],
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
      text: `${node.identifier} ${node.versions[0].version}`,
      isChecked,
      parent: undefined,
      checkProps: { 'aria-label': `Select ${node.identifier}` },
      hasBadge: true,
      badgeProps: { isRead: true },
      defaultExpanded: false,
      children: buildACROptions(
        isChosen,
        node,
        node.versions[0].roles, // TODO: Although only a single version can exist, this is not enforced yet
        hasParentMatch
      ),
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
    parent: AnsibleContentUnitFull,
    [node, ...remainingNodes]: AnsibleCollectionRole[],
    hasParentMatch: boolean
  ): ContentUnitTreeItemData[] => {
    if (!node) {
      return [];
    }

    const isChecked =
      selectedRoles &&
      selectedRoles[parent.id] &&
      selectedRoles[parent.id].some(selectedRole => selectedRole === node.name);

    const isDisplayed: boolean = isChosen
      ? chosenUnits[parent.id] &&
        chosenUnits[parent.id].some(chosenRole => chosenRole === node.name)
      : true;

    const treeNode = {
      id: node.id,
      text: node.name,
      isChecked,
      checkProps: { 'aria-label': `Select ${node.name}` },
      hasBadge: false,
      parent,
    };

    return [
      ...(isDisplayed ? [treeNode as ContentUnitTreeItemData] : []),
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
          isDisabled={Object.keys(selectedRoles).length === 0}
          onClick={() => moveChecked(true)}
          aria-label="Add selected"
        >
          <AngleRightIcon />
        </DualListSelectorControl>
        <DualListSelectorControl
          onClick={() => moveChecked(false)}
          isDisabled={Object.keys(selectedRoles).length === 0}
          aria-label="Remove selected"
        >
          <AngleLeftIcon />
        </DualListSelectorControl>
      </DualListSelectorControlsWrapper>
      {buildPane(true)}
    </DualListSelector>
  );
};

export const LceAssignmentSelector: React.FC<ContentUnitSelectorProps> = ({
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
