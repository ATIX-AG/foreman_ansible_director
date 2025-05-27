import React from 'react';
import {
  DualListSelector,
  DualListSelectorPane,
  DualListSelectorList,
  DualListSelectorControlsWrapper,
  DualListSelectorControl,
  DualListSelectorTree,
  DualListSelectorTreeItemData,
  SearchInput,
  Button,
  EmptyState,
  EmptyStateVariant,
  EmptyStateHeader,
  EmptyStateFooter,
  EmptyStateBody,
  EmptyStateActions,
  EmptyStateIcon,
} from '@patternfly/react-core';
import AngleDoubleLeftIcon from '@patternfly/react-icons/dist/esm/icons/angle-double-left-icon';
import AngleLeftIcon from '@patternfly/react-icons/dist/esm/icons/angle-left-icon';
import AngleDoubleRightIcon from '@patternfly/react-icons/dist/esm/icons/angle-double-right-icon';
import AngleRightIcon from '@patternfly/react-icons/dist/esm/icons/angle-right-icon';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import {
  AnsibleContentUnit,
  AnsibleContentVersion,
} from '../../../../../types/AnsibleContentTypes';

interface FoodNode {
  id: string;
  text: string;
  children?: FoodNode[];
}

interface ExampleProps {
  data: AnsibleContentUnit[];
}

interface ContentUnitSelectorProps {
  contentUnits: AnsibleContentUnit[];
}

interface ContentUnitTreeItemData extends DualListSelectorTreeItemData {
  parent: undefined | AnsibleContentUnit;
}

export const DualListSelectorComposableTree: React.FC<ExampleProps> = ({
  data,
}: ExampleProps) => {
  const [selectedVersions, setSelectedVersions] = React.useState<{
    [unit: string]: string;
  }>();

  const [chosenUnits, setChosenUnits] = React.useState<Array<string>>([]);

  const [checkedLeafIds, setCheckedLeafIds] = React.useState<string[]>([]);
  const [chosenLeafIds, setChosenLeafIds] = React.useState<string[]>([
    'beans',
    'beef',
    'chicken',
    'tofu',
  ]);
  const [chosenFilter, setChosenFilter] = React.useState<string>('');
  const [availableFilter, setAvailableFilter] = React.useState<string>('');
  const hiddenChosen: string[] = [];
  const hiddenAvailable: string[] = [];

  // helper function to build memoized lists
  const buildTextById = (node: FoodNode): { [key: string]: string } => {
    let textById = {};
    if (!node) {
      return textById;
    }
    textById[node.id] = node.text;
    if (node.children) {
      node.children.forEach(child => {
        textById = { ...textById, ...buildTextById(child) };
      });
    }
    return textById;
  };

  // helper function to build memoized lists
  const getDescendantLeafIds = (node: FoodNode): string[] => {
    if (!node.children || !node.children.length) {
      return [node.id];
    }
    let childrenIds: string[] = [];
    node.children.forEach(child => {
      childrenIds = [...childrenIds, ...getDescendantLeafIds(child)];
    });
    return childrenIds;
  };

  // helper function to build memoized lists
  const getAnsibleContentVersionsById = (
    node: AnsibleContentUnit
  ): { [key: string]: string[] } => {
    let leavesById = {};
    if (!node.children || !node.children.length) {
      leavesById[node.id] = [node.id];
    } else {
      node.children.forEach(child => {
        leavesById[node.id] = getDescendantLeafIds(node);
        leavesById = { ...leavesById, ...getAnsibleContentVersionsById(child) };
      });
    }
    return leavesById;
  };

  // Builds a map of child leaf nodes by node id - memoized so that it only rebuilds the list if the data changes.
  const {
    memoizedLeavesById,
    memoizedAllLeaves,
    memoizedNodeText,
  } = React.useMemo(() => {
    let acvsById = {};
    let allLeaves: string[] = [];
    let nodeTexts = {};
    data.forEach(acu => {
      nodeTexts = { ...nodeTexts, ...buildTextById(acu) };
      acvsById = { ...acvsById, ...getAnsibleContentVersionsById(acu) };
      allLeaves = [...allLeaves, ...getDescendantLeafIds(acu)];
    });
    return {
      memoizedLeavesById: acvsById,
      memoizedAllLeaves: allLeaves,
      memoizedNodeText: nodeTexts,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const moveChecked = (toChosen: boolean) => {
    setChosenLeafIds(
      prevChosenIds =>
        toChosen
          ? [...prevChosenIds, ...checkedLeafIds] // add checked ids to chosen list
          : [...prevChosenIds.filter(x => !checkedLeafIds.includes(x))] // remove checked ids from chosen list
    );

    // uncheck checked ids that just moved
    setCheckedLeafIds(prevChecked =>
      toChosen
        ? [...prevChecked.filter(x => chosenLeafIds.includes(x))]
        : [...prevChecked.filter(x => !chosenLeafIds.includes(x))]
    );
  };

  const moveAll = (toChosen: boolean) => {
    if (toChosen) {
      setChosenLeafIds(memoizedAllLeaves);
    } else {
      setChosenLeafIds([]);
    }
  };

  const areAllDescendantsSelected = (node: FoodNode, isChosen: boolean) =>
    memoizedLeavesById[node.id].every(
      id =>
        checkedLeafIds.includes(id) &&
        (isChosen ? chosenLeafIds.includes(id) : !chosenLeafIds.includes(id))
    );
  const areSomeDescendantsSelected = (node: FoodNode, isChosen: boolean) =>
    memoizedLeavesById[node.id].some(
      id =>
        checkedLeafIds.includes(id) &&
        (isChosen ? chosenLeafIds.includes(id) : !chosenLeafIds.includes(id))
    );

  const isNodeChecked = (node: FoodNode, isChosen: boolean) => {
    if (areAllDescendantsSelected(node, isChosen)) {
      return true;
    }
    if (areSomeDescendantsSelected(node, isChosen)) {
      return false;
    }
    return false;
  };

  const onOptionCheck = (
    event:
      | React.MouseEvent
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent,
    isChecked: boolean,
    node: ContentUnitTreeItemData,
    isChosen: boolean
  ) => {
    const versions = selectedVersions || {};

    if (node.parent) {
      if (isChecked) {
        versions[node.parent.identifier] = node.text;
      } else {
        versions[node.parent.identifier] = '';
      }
    } else if (!isChecked) {
      // If parent is undefined, the ACU was clicked
      versions[node.text] = ''; // In that case node.text is the identifier
    }

    setSelectedVersions({ ...versions });
  };

  // builds a search input - used in each dual list selector pane
  const buildSearchInput = (isChosen: boolean) => {
    const onChange = value =>
      isChosen ? setChosenFilter(value) : setAvailableFilter(value);

    return (
      <SearchInput
        value={isChosen ? chosenFilter : availableFilter}
        onChange={(_event, value) => onChange(value)}
        onClear={() => onChange('')}
      />
    );
  };

  // Builds the DualListSelectorTreeItems from the FoodNodes
  const buildACUOptions = (
    isChosen: boolean,
    [node, ...remainingNodes]: AnsibleContentUnit[],
    hasParentMatch: boolean
  ): ContentUnitTreeItemData[] => {
    if (!node) {
      return [];
    }

    const isChecked = selectedVersions && selectedVersions[node.identifier];

    const filterValue = isChosen ? chosenFilter : availableFilter;
    const descendentLeafIds = memoizedLeavesById[node.id];
    const descendentsOnThisPane = isChosen
      ? descendentLeafIds.filter(id => chosenLeafIds.includes(id))
      : descendentLeafIds.filter(id => !chosenLeafIds.includes(id));

    const hasMatchingChildren =
      filterValue &&
      descendentsOnThisPane.some(id =>
        memoizedNodeText[id].includes(filterValue)
      );
    const isFilterMatch =
      filterValue &&
      node.text.includes(filterValue) &&
      descendentsOnThisPane.length > 0;

    // A node is displayed if either of the following is true:
    //   - There is no filter value and this node or its descendents belong on this pane
    //   - There is a filter value and this node or one of this node's descendents or ancestors match on this pane

    const isDisplayed: boolean = isChosen
      ? chosenUnits.includes(node.identifier)
      : !chosenUnits.includes(node.identifier);

    // (!filterValue && descendentsOnThisPane.length > 0) ||
    // hasMatchingChildren ||
    // (hasParentMatch && descendentsOnThisPane.length > 0) ||
    // isFilterMatch;

    // if (!isDisplayed) {
    //  if (isChosen) {
    //    hiddenChosen.push(node.id);
    //  } else {
    //    hiddenAvailable.push(node.id);
    //  }
    // }

    const treeNode = {
      id: node.identifier,
      text: node.identifier,
      isChecked,
      checkProps: { 'aria-label': `Select ${node.identifier}` },
      hasBadge: true,
      badgeProps: { isRead: true },
      defaultExpanded: false,
      children: buildACVOptions(isChosen, node, node.versions, hasParentMatch),
    };

    return [
      ...(isDisplayed ? [treeNode] : []),
      // ...(!isDisplayed && node.children && node.children.length
      //  ? buildACUOptions(isChosen, node.children, hasParentMatch)
      //  : []),
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

    console.log(selectedVersions);

    const isChecked =
      selectedVersions && selectedVersions[parent.identifier] === node.version;
    console.log('acv chacked:', isChecked);

    // const filterValue = isChosen ? chosenFilter : availableFilter;
    // const descendentLeafIds = memoizedLeavesById[node.id];
    // const descendentsOnThisPane = isChosen
    //  ? descendentLeafIds.filter(id => chosenLeafIds.includes(id))
    //  : descendentLeafIds.filter(id => !chosenLeafIds.includes(id));

    // const hasMatchingChildren =
    //  filterValue &&
    //  descendentsOnThisPane.some(id =>
    //    memoizedNodeText[id].includes(filterValue)
    //  );
    // const isFilterMatch =
    //  filterValue &&
    //  node.text.includes(filterValue) &&
    //  descendentsOnThisPane.length > 0;

    // A node is displayed if either of the following is true:
    //   - There is no filter value and this node or its descendents belong on this pane
    //   - There is a filter value and this node or one of this node's descendents or ancestors match on this pane
    const isDisplayed = true;
    // (!filterValue && descendentsOnThisPane.length > 0) ||
    // hasMatchingChildren ||
    // (hasParentMatch && descendentsOnThisPane.length > 0) ||
    // isFilterMatch;

    // if (!isDisplayed) {
    //  if (isChosen) {
    //    hiddenChosen.push(node.id);
    //  } else {
    //    hiddenAvailable.push(node.id);
    //  }
    // }

    return [
      ...(isDisplayed
        ? [
          {
            id: node.version,
            text: node.version,
            isChecked,
            checkProps: { 'aria-label': `Select ${node.version}` },
            hasBadge: false,
            parent,
          },
        ]
        : []),
      // ...(!isDisplayed && node.children && node.children.length
      //  ? buildACUOptions(isChosen, node.children, hasParentMatch)
      //  : []),
      ...(remainingNodes
        ? buildACVOptions(isChosen, parent, remainingNodes, hasParentMatch)
        : []),
    ];
  };

  const buildPane = (isChosen: boolean): React.ReactNode => {
    const options: ContentUnitTreeItemData[] = buildACUOptions(
      isChosen,
      data,
      false
    );
    // const filterApplied = isChosen ? chosenFilter !== '' : availableFilter !== '';
    return (
      <DualListSelectorPane
        title={isChosen ? 'Chosen' : 'Available'}
        searchInput=""
        isChosen={isChosen}
        listMinHeight="300px"
      >
        {/*         {filterApplied && options.length === 0 && (
          <EmptyState variant={EmptyStateVariant.sm}>
            <EmptyStateHeader
              headingLevel="h4"
              titleText="No results found"
              icon={<EmptyStateIcon icon={SearchIcon} />}
            />
            <EmptyStateBody>No results match the filter criteria. Clear all filters and try again.</EmptyStateBody>
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="link" onClick={() => (isChosen ? setChosenFilter('') : setAvailableFilter(''))}>
                  Clear all filters
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          </EmptyState>
        )} */}
        {options.length > 0 && (
          <DualListSelectorList>
            <DualListSelectorTree
              data={options}
              onOptionCheck={(e, isChecked, itemData) =>
                onOptionCheck(e, isChecked, itemData, isChosen)
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
      {/* <DualListSelectorControlsWrapper>
        <DualListSelectorControl
          isDisabled={
            !checkedLeafIds.filter(x => !chosenLeafIds.includes(x)).length
          }
          onClick={() => moveChecked(true)}
          aria-label="Add selected"
        >
          <AngleRightIcon />
        </DualListSelectorControl>
        <DualListSelectorControl
          isDisabled={chosenLeafIds.length === memoizedAllLeaves.length}
          onClick={() => moveAll(true)}
          aria-label="Add all"
        >
          <AngleDoubleRightIcon />
        </DualListSelectorControl>
        <DualListSelectorControl
          isDisabled={chosenLeafIds.length === 0}
          onClick={() => moveAll(false)}
          aria-label="Remove all"
        >
          <AngleDoubleLeftIcon />
        </DualListSelectorControl>
        <DualListSelectorControl
          onClick={() => moveChecked(false)}
          isDisabled={
            !checkedLeafIds.filter(x => !!chosenLeafIds.includes(x)).length
          }
          aria-label="Remove selected"
        >
          <AngleLeftIcon />
        </DualListSelectorControl>
      </DualListSelectorControlsWrapper> */}
      {buildPane(true)}
    </DualListSelector>
  );
};

export const ContentUnitSelector: React.FC<ContentUnitSelectorProps> = ({
  contentUnits,
}) => (
  <DualListSelectorComposableTree
    /* data={contentUnits.map(unit => ({
      id: `${unit.type}-${unit.identifier}`,
      text: unit.identifier,
      isChecked: false,
      checkProps: { 'aria-label': `${unit.type}-${unit.identifier}` },
      hasBadge: true,
      badgeProps: { isRead: true },
      children: unit.versions.map((version: AnsibleContentVersion) => ({
        id: `${unit.identifier}-${version.version}`,
        text: version.version,
        isChecked: false,
      })),
    }))} */
    data={contentUnits}
  />
);
