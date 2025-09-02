import React, { Dispatch, ReactElement, SetStateAction } from 'react';
import { ContentUnitSelector } from '../../../../ansible_execution_environments/components/components/components/ContentUnitSelector';
import { AnsibleContentUnit } from '../../../../../types/AnsibleContentTypes';

interface AssignmentComponentProps {
  lceUnits: AnsibleContentUnit[];
  chosenUnits: { [unit: string]: string };
  setChosenUnits: Dispatch<SetStateAction<{ [unit: string]: string }>>;
}

export const AssignmentComponent = ({
  lceUnits,
  chosenUnits,
  setChosenUnits,
}: AssignmentComponentProps): ReactElement => {
  // const [target, setTarget] = React.useState<{content: []}>({content: []});

  // eslint-disable-next-line no-unused-vars
  const a = 2;
  return (
    <ContentUnitSelector
      contentUnits={lceUnits}
      targetContentUnits={[]}
      chosenUnits={chosenUnits}
      setChosenUnits={setChosenUnits}
    />
  );
};
