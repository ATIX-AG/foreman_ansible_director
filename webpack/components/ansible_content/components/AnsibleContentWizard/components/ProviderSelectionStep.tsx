import React, { Dispatch, SetStateAction } from 'react';
import { Tile, Flex, FlexItem, ListItem, List } from '@patternfly/react-core';
import FileIcon from '@patternfly/react-icons/dist/esm/icons/file-icon';
import TopologyIcon from '@patternfly/react-icons/dist/esm/icons/topology-icon';
import CodeBranchIcon from '@patternfly/react-icons/dist/esm/icons/code-branch-icon';

import { translate as _ } from 'foremanReact/common/I18n';

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
          {_(
            'Import Ansible collections and roles from any source that implements the Ansible Galaxy API.'
          )}
          <br />
          {_('Supported sources include:')}
          <List>
            <ListItem>
              {' '}
              <strong>Ansible Galaxy</strong> -{' '}
              <a href="https://galaxy.ansible.com">
                https://galaxy.ansible.com
              </a>{' '}
              {_('- The official community repository')}
            </ListItem>
            <ListItem>
              <strong>{_('Private Galaxy servers')}</strong>
              {_(' - Self-hosted instances based on ')}
              <a href="https://pulpproject.org/">Pulp</a>
            </ListItem>
            <ListItem>
              {' '}
              <a href="/content_views">{_('Content views')}</a>
              {_(
                ' - Repositories of type ansible collection, which are published in a content view.'
              )}
            </ListItem>
          </List>
        </Tile>
      </FlexItem>
      <FlexItem style={{ width: '30%' }}>
        {' '}
        <Tile
          title={_('Git repository')}
          icon={<CodeBranchIcon />}
          isStacked
          isDisplayLarge
          isSelected={provider === 'git'}
          onClick={() => setProvider('git')}
          style={{ width: '100%', height: '100%', minHeight: '340px' }}
        >
          {_('Import an Ansible collection or role from a git repository.')}
          <br />
          <strong>
            {_(
              'Note: The repository must be sufficiently decorated with a galaxy.yml file.'
            )}
          </strong>
          <br />
          <p>
            <strong>{_('Supported sources:')}</strong>
          </p>
          <List>
            <ListItem>
              <List>{_('Any server implementing the Git API.')}</List>
            </ListItem>
          </List>
        </Tile>
      </FlexItem>
      <FlexItem style={{ width: '30%' }}>
        {' '}
        <Tile
          title={_('YML file')}
          icon={<FileIcon />}
          isStacked
          isDisplayLarge
          isSelected={provider === 'yaml'}
          onClick={() => setProvider('yaml')}
          style={{ width: '100%', height: '100%', minHeight: '340px' }}
        >
          <p>
            <strong>
              {_('Import Ansible content from requirements file')}
            </strong>
            <br />
            {_(
              'Import Ansible collections and roles by using a YML file. Compatible with the official ansible-galaxy requirements format.'
            )}
          </p>
          <p>
            <strong>{_('Supported sources:')}</strong>
          </p>
          <List>
            <ListItem>{_('Ansible Galaxy API-enabled servers')}</ListItem>
            <ListItem>{_('Git repositories')}</ListItem>
          </List>
        </Tile>
      </FlexItem>
    </Flex>
  </div>
);

export default ProviderSelectionStep;
