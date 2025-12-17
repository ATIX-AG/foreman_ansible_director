import React, { Dispatch, SetStateAction } from 'react';
import { Tile, Flex, FlexItem, ListItem, List } from '@patternfly/react-core';
import FileIcon from '@patternfly/react-icons/dist/esm/icons/file-icon';
import TopologyIcon from '@patternfly/react-icons/dist/esm/icons/topology-icon';
import CodeBranchIcon from '@patternfly/react-icons/dist/esm/icons/code-branch-icon';

interface ProviderSelectionStepProps {
  provider: 'galaxy' | 'git' | 'yaml' | undefined;
  setProvider: Dispatch<SetStateAction<'galaxy' | 'git' | 'yaml' | undefined>>;
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
      <FlexItem style={{ width: '30%' }}>
        {' '}
        <Tile
          title="Ansible Galaxy"
          icon={<TopologyIcon />}
          isStacked
          isDisplayLarge
          isSelected={provider === 'galaxy'}
          onClick={() => setProvider('galaxy')}
          style={{ width: '100%', height: '100%', minHeight: '340px' }}
        >
          Import Ansible collections and roles from any source that implements
          the Ansible Galaxy API.
          <br />
          Supported sources include:
          <List>
            <ListItem>
              {' '}
              <strong>Ansible Galaxy</strong> -{' '}
              <a href="https://galaxy.ansible.com">
                https://galaxy.ansible.com
              </a>{' '}
              - The official community repository
            </ListItem>
            <ListItem>
              <strong>Private Galaxy servers</strong> - Self-hosted instances
              based on <a href="https://pulpproject.org/">Pulp</a>
            </ListItem>
            <ListItem>
              {' '}
              <strong>Content views</strong> -{' '}
              <a href="/ContentViews">Content Views</a> - Repositories of type
              &#34;ansible collection&#34; which are published in a CV
            </ListItem>
          </List>
        </Tile>
      </FlexItem>
      <FlexItem style={{ width: '30%' }}>
        {' '}
        <Tile
          title="Git repository"
          icon={<CodeBranchIcon />}
          isStacked
          isDisplayLarge
          isSelected={provider === 'git'}
          onClick={() => setProvider('git')}
          style={{ width: '100%', height: '100%', minHeight: '340px' }}
        >
          Import Ansible collections and roles from a git repository.
          <br />
          <strong>
            Note: The repository must be sufficiently decorated with a
            galaxy.yml file.
          </strong>
          <br />
          <p>
            <strong>Supported sources:</strong>
          </p>
          <ul>
            <li>Any server implementing the git API</li>
          </ul>
        </Tile>
      </FlexItem>
      <FlexItem style={{ width: '30%' }}>
        {' '}
        <Tile
          title="Y(A)ML File"
          icon={<FileIcon />}
          isStacked
          isDisplayLarge
          isSelected={provider === 'yaml'}
          onClick={() => setProvider('yaml')}
          style={{ width: '100%', height: '100%', minHeight: '340px' }}
        >
          <p>
            <strong>Bulk Import Ansible Content</strong>
            <br />
            Import multiple Ansible collections and roles efficiently using a
            Y(A)ML file. Supports a subset of the official ansible-galaxy
            requirements format.
          </p>
          <p>
            <strong>Supported sources:</strong>
          </p>
          <ul>
            <li>Ansible Galaxy API-enabled servers</li>
            <li>Git repositories</li>
          </ul>
        </Tile>
      </FlexItem>
    </Flex>
  </div>
);

export default ProviderSelectionStep;
