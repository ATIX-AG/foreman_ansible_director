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
} from '@patternfly/react-core';
import { AnsibleContentUnitCreate } from '../../../../../types/AnsibleContentTypes';

interface ReviewStepProps {
  contentUnits: AnsibleContentUnitCreate[];
  setContentUnits: Dispatch<SetStateAction<Array<AnsibleContentUnitCreate>>>;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  contentUnits,
  setContentUnits,
}) => {
  const deleteUnitVersion = (
    unit: AnsibleContentUnitCreate,
    version: string
  ): void => {
    unit.versions = unit.versions.filter(
      unitVersion => unitVersion.version !== version
    );
    setContentUnits(units => [...units]);
  };

  const deleteUnit = (index: number): void => {
    contentUnits.splice(index, 1);
    setContentUnits(units => [...units]);
  };

  const listItems = (): Array<React.ReactNode> =>
    contentUnits.map((unit, index) => (
      <DataListItem aria-labelledby="single-action-item1">
        <DataListItemRow>
          <DataListItemCells
            dataListCells={[
              <DataListCell key="primary content">
                <span id="single-action-item1">
                  <TextContent>
                    <Text component={TextVariants.h3}>{unit.identifier}</Text>
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
    ));

  return (
    <React.Fragment>
      <DataList aria-label="single action data list example">
        {listItems()}
      </DataList>
    </React.Fragment>
  );
};
