import React, { Dispatch, ReactElement, SetStateAction } from 'react';
import { ContentUnitSelector } from '../../../../ansible_execution_environments/components/components/components/ContentUnitSelector';
import {
  AnsibleContentUnit,
  AnsibleContentUnitFull,
} from '../../../../../types/AnsibleContentTypes';
import { AssignmentSelector } from './AssignmentSelector';
import {
  Card,
  CardBody,
  ExpandableSection,
  Grid,
  GridItem,
  TreeView,
  TreeViewDataItem,
} from '@patternfly/react-core';

interface AssignmentComponentProps {
  lceUnits: {
    collections: AnsibleContentUnitFull[];
    roles: AnsibleContentUnit[];
  };
  chosenUnits: { [unit: string]: string[] };
  setChosenUnits: Dispatch<SetStateAction<{ [unit: string]: string[] }>>;
}

export const AssignmentComponent = ({
  lceUnits,
  chosenUnits,
  setChosenUnits,
}: AssignmentComponentProps): ReactElement => {
  // const [target, setTarget] = React.useState<{content: []}>({content: []});

  const [activeItems, setActiveItems] = React.useState<TreeViewDataItem[]>();

  const onSelect = (
    _event: React.MouseEvent,
    treeViewItem: TreeViewDataItem
  ): void => {
    // Ignore folders for selection
    if (treeViewItem && !treeViewItem.children) {
      setActiveItems([treeViewItem]);
    }
  };

  const [isRolesExpanded, setIsRolesExpanded] = React.useState(false);
  const [isCollectionsExpanded, setIsCollectionsExpanded] = React.useState(
    false
  );

  const options = [
    {
      name: 'Execution environment',
      id: 'ee-item',
      customBadgeContent: 'EE-10.4.2',
    },
    {
      name: 'Inherited',
      id: 'inherited-root-item',
      customBadgeContent: '2 CUs',
      children: [
        {
          name: 'Collections',
          id: 'inherited-collections-item',
        },
        {
          name: 'Roles',
          id: 'inherited-roles-item',
        },
      ],
      defaultExpanded: true,
    },
    {
      name: 'Collections',
      id: 'collections-item',
      customBadgeContent: 'EE-10.4.2',
    },
    {
      name: 'Roles',
      id: 'roles-item',
      customBadgeContent: 'EE-10.4.2',
    },
    {
      name: 'Sources',
      id: 'example6-Sources',
      customBadgeContent: '1 source',
    },
  ];
  return (
    <>
      <Grid hasGutter>
        <GridItem span={3}>
          <Card>
            <CardBody>
              <TreeView data={options} hasBadges onSelect={onSelect} />
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={9}>
          <Card>
            <CardBody>
              <AssignmentSelector
                contentUnits={lceUnits.collections}
                targetContentUnits={[]}
                chosenUnits={chosenUnits}
                setChosenUnits={setChosenUnits}
              />
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </>
  );
};
