import React, { ReactElement } from 'react';
import { Flex, FlexItem, Label } from '@patternfly/react-core';
import { AnsibleContentVersion } from '../../../../types/AnsibleContentTypes';

interface ContentUnitVersionListProps {
  contentUnitVersions: AnsibleContentVersion[];
  selectedVersionId: number | null;
  onVersionSelect: (versionId: number) => void;
}

export const ContentUnitVersionList = ({
  contentUnitVersions,
  selectedVersionId,
  onVersionSelect,
}: ContentUnitVersionListProps): ReactElement => {

  return (
    <Flex gap={{ default: 'gapSm' }}>
      {contentUnitVersions.map(cuv => (
        <FlexItem key={cuv.id}>
          <Label
            color="blue"
            variant={cuv.id === selectedVersionId ? 'filled' : 'outline'}
            onClick={() => onVersionSelect(cuv.id)}
          >
            {cuv.version}
          </Label>
        </FlexItem>
      ))}
    </Flex>
  );
};
