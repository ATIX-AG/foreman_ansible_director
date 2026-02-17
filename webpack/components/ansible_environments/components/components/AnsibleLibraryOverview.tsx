import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import { useAPI, UseAPIReturn } from 'foremanReact/common/hooks/API/APIHooks';
import { foremanUrl } from 'foremanReact/common/helpers';
import { translate as _ } from 'foremanReact/common/I18n';

import React from 'react';
import {
  Button,
  Card,
  CardBody,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Flex,
  FlexItem,
  Spinner,
  TextContent,
  Text,
  TextVariants,
  Divider,
} from '@patternfly/react-core';
import ExternalLinkSquareAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-square-alt-icon';

interface GetAnsibleLibraryResponse {
  roles: number;
  collections: number;
  // eslint-disable-next-line camelcase
  execution_environments: number;
}

export const AnsibleLibraryOverview: React.FC = () => {
  const organization = useForemanOrganization();

  const contentRequest: UseAPIReturn<GetAnsibleLibraryResponse> = useAPI<
    GetAnsibleLibraryResponse
  >(
    'get',
    foremanUrl(
      `/api/v2/ansible_director/status/content${
        organization ? `?organization_id=${organization.id}&` : ''
      }`
    )
  );

  if (contentRequest.status === 'RESOLVED') {
    return (
      <Card>
        <CardBody style={{ padding: '10px' }}>
          <Flex
            className="example-border"
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
          >
            <FlexItem>
              <TextContent>
                <Text component={TextVariants.h3}>{_('Library')}</Text>
              </TextContent>
            </FlexItem>
            <Divider
              component="div"
              orientation={{
                default: 'vertical',
              }}
            />
            <FlexItem>
              <Button
                variant="link"
                countOptions={{
                  isRead: false,
                  count: contentRequest.response.roles,
                  className: 'custom-badge-unread',
                }}
                icon={<ExternalLinkSquareAltIcon />}
              >
                {_('Roles')}
              </Button>{' '}
            </FlexItem>
            <Divider
              component="div"
              orientation={{
                default: 'vertical',
              }}
            />
            <FlexItem>
              <Button
                variant="link"
                countOptions={{
                  isRead: false,
                  count: contentRequest.response.collections,
                  className: 'custom-badge-unread',
                }}
                icon={<ExternalLinkSquareAltIcon />}
              >
                {_('Collections')}
              </Button>{' '}
            </FlexItem>
            <Divider
              component="div"
              orientation={{
                default: 'vertical',
              }}
            />
            <FlexItem>
              <Button
                variant="link"
                countOptions={{
                  isRead: false,
                  count: contentRequest.response.execution_environments,
                  className: 'custom-badge-unread',
                }}
                icon={<ExternalLinkSquareAltIcon />}
              >
                {_('Execution Environments')}
              </Button>{' '}
            </FlexItem>{' '}
            <Divider
              component="div"
              orientation={{
                default: 'vertical',
              }}
            />
          </Flex>
        </CardBody>
      </Card>
    );
  } else if (contentRequest.status === 'ERROR') {
    // TODO: Handle request error
    return null;
  }
  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={_('Loading Library...')}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={Spinner} />}
      />
    </EmptyState>
  );
};
