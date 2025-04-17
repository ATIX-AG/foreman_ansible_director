import React, { Dispatch, SetStateAction } from 'react';
import { Tile, Flex, FlexItem } from '@patternfly/react-core';
import FileIcon from '@patternfly/react-icons/dist/esm/icons/file-icon';
import TopologyIcon from '@patternfly/react-icons/dist/esm/icons/topology-icon';

interface ProviderSelectionStepProps {
  provider: 'galaxy' | 'yaml' | undefined;
  setProvider: Dispatch<SetStateAction<'galaxy' | 'yaml' | undefined>>;
}

const ProviderSelectionStep: React.FC<ProviderSelectionStepProps> = ({
  provider,
  setProvider,
}) => (
  <div style={{ height: '450px' }}>
    <Flex
      className="example-border"
      justifyContent={{ default: 'justifyContentSpaceBetween' }}
      style={{ height: '100%' }}
      alignItems={{ default: 'alignItemsCenter' }}
    >
      <FlexItem style={{ width: '45%' }}>
        {' '}
        <Tile
          title="Ansible Galaxy"
          icon={<TopologyIcon />}
          isStacked
          isDisplayLarge
          isSelected={provider === 'galaxy'}
          onClick={() => setProvider('galaxy')}
          style={{ width: '100%', height: '100%' }}
        >
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
          nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
          sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
          rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem
          ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
          sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
          dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
          et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
          takimata sanctus est Lorem ipsum dolor sit amet.
        </Tile>
      </FlexItem>
      <FlexItem style={{ width: '45%' }}>
        {' '}
        <Tile
          title="Y(A)ML File"
          icon={<FileIcon />}
          isStacked
          isDisplayLarge
          isSelected={provider === 'yaml'}
          onClick={() => setProvider('yaml')}
          style={{ width: '100%', height: '100%' }}
        >
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
          nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
          sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
          rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem
          ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
          sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
          dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
          et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
          takimata sanctus est Lorem ipsum dolor sit amet.
        </Tile>
      </FlexItem>
    </Flex>
  </div>
);

export default ProviderSelectionStep;
