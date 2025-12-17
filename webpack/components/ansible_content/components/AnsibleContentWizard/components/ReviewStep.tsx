import React, { Dispatch, SetStateAction } from 'react';
import {
  Button,
  DataList,
  DataListItem,
  DataListCell,
  DataListItemRow,
  DataListItemCells,
  DataListAction,
  ChipGroup,
  Chip,
  TextContent,
  Text,
  TextVariants,
  Icon,
} from '@patternfly/react-core';
import TopologyIcon from '@patternfly/react-icons/dist/esm/icons/topology-icon';
import CodeBranchIcon from '@patternfly/react-icons/dist/esm/icons/code-branch-icon';
import {
  AnsibleContentUnitCreateType,
  isAnsibleGalaxyContentUnitCreate,
  isAnsibleGitContentUnitCreate,
} from '../AnsibleContentWizard';

interface ReviewStepProps {
  contentUnits: AnsibleContentUnitCreateType[];
  setContentUnits: Dispatch<
    SetStateAction<Array<AnsibleContentUnitCreateType>>
  >;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  contentUnits,
  setContentUnits,
}) => {
  const deleteUnitVersion = (
    unit: AnsibleContentUnitCreateType,
    version: string
  ): void => {
    if (isAnsibleGalaxyContentUnitCreate(unit)) {
      unit.versions = unit.versions.filter(
        unitVersion => unitVersion.version !== version
      );
    } else if (isAnsibleGitContentUnitCreate(unit)) {
      unit.gitRefs = unit.gitRefs.filter(ref => ref !== version);
    }

    setContentUnits(units => [...units]);
  };

  const deleteUnit = (index: number): void => {
    contentUnits.splice(index, 1);
    setContentUnits(units => [...units]);
  };

  const listItems = (): Array<React.ReactNode> =>
    contentUnits.map((unit, index) => {
      if (isAnsibleGalaxyContentUnitCreate(unit)) {
        return (
          <DataListItem aria-labelledby="single-action-item1">
            <DataListItemRow>
              <DataListItemCells
                dataListCells={[
                  <DataListCell key="primary content">
                    <Icon size="md">
                      <TopologyIcon />
                    </Icon>
                  </DataListCell>,
                  <DataListCell key="primary content">
                    <span id="single-action-item1">
                      <TextContent>
                        <Text component={TextVariants.h3}>
                          {unit.identifier}
                        </Text>
                      </TextContent>
                    </span>
                  </DataListCell>,
                  <DataListCell key="secondary content">
                    <ChipGroup>
                      {unit.versions.length > 0 ? (
                        unit.versions.map(version => (
                          <Chip
                            key={`${unit.identifier}_${version.version}`}
                            onClick={() => {
                              deleteUnitVersion(unit, version.version);
                            }}
                          >
                            {version.version}
                          </Chip>
                        ))
                      ) : (
                        <Chip
                          key={`${unit.identifier}_all`}
                          onClick={() => {}}
                          isReadOnly
                        >
                          All existing versions
                        </Chip>
                      )}
                    </ChipGroup>
                  </DataListCell>,
                ]}
              />
              <DataListAction
                aria-labelledby="single-action-item1 single-action-action1"
                id="single-action-action1"
                aria-label="Actions"
              >
                <Button
                  onClick={() => {
                    deleteUnit(index);
                  }}
                  variant="danger"
                  key="delete-action"
                >
                  Delete
                </Button>
              </DataListAction>
            </DataListItemRow>
          </DataListItem>
        );
      } else if (isAnsibleGitContentUnitCreate(unit)) {
        return (
          <DataListItem aria-labelledby="single-action-item1">
            <DataListItemRow>
              <DataListItemCells
                dataListCells={[
                  <DataListCell key="primary content">
                    <Icon size="md">
                      <CodeBranchIcon />
                    </Icon>
                  </DataListCell>,
                  <DataListCell key="primary content">
                    <span id="single-action-item1">
                      <TextContent>
                        <Text component={TextVariants.h3}>
                          {unit.identifier}
                        </Text>
                      </TextContent>
                    </span>
                  </DataListCell>,
                  <DataListCell key="secondary content">
                    <ChipGroup>
                      {unit.gitRefs.length > 0 ? (
                        unit.gitRefs.map(ref => (
                          <Chip
                            key={`${unit.identifier}_${ref}`}
                            onClick={() => {
                              deleteUnitVersion(unit, ref);
                            }}
                          >
                            {ref}
                          </Chip>
                        ))
                      ) : (
                        <Chip
                          key={`${unit.identifier}_all`}
                          onClick={() => {}}
                          isReadOnly
                        >
                          All existing versions
                        </Chip>
                      )}
                    </ChipGroup>
                  </DataListCell>,
                ]}
              />
              <DataListAction
                aria-labelledby="single-action-item1 single-action-action1"
                id="single-action-action1"
                aria-label="Actions"
              >
                <Button
                  onClick={() => {
                    deleteUnit(index);
                  }}
                  variant="danger"
                  key="delete-action"
                >
                  Delete
                </Button>
              </DataListAction>
            </DataListItemRow>
          </DataListItem>
        );
      }

      return null;
    });

  return (
    <React.Fragment>
      <DataList aria-label="single action data list example">
        {listItems()}
      </DataList>
    </React.Fragment>
  );
};
