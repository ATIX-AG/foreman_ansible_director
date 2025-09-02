import React, { ReactElement, useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  EmptyStateBody,
  EmptyState,
  EmptyStateHeader,
  GridItem,
  List,
  ListItem,
} from '@patternfly/react-core';
import ExternalLinkSquareAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-square-alt-icon';

import { AnsibleLce } from '../../../../../types/AnsibleEnvironmentsTypes';
import { AnsibleContentUnitAssignment } from '../../../../../types/AnsibleContentTypes';

interface LceContentListProps {
  lce: AnsibleLce;
}
export const LceContentList = ({ lce }: LceContentListProps): ReactElement => {
  const [lceRoles, setLceRoles] = useState<AnsibleContentUnitAssignment[]>([]);
  const [lceCollections, setLceCollections] = useState<
    AnsibleContentUnitAssignment[]
  >([]);

  useEffect(() => {
    const roles: AnsibleContentUnitAssignment[] = [];
    const collections: AnsibleContentUnitAssignment[] = [];

    lce.content.forEach(cu => {
      if (cu.type === 'role') {
        roles.push(cu);
      } else {
        collections.push(cu);
      }
    });

    setLceRoles(roles);
    setLceCollections(collections);
  }, [lce]);

  const emptyStateFor = (
    contentType: 'collections' | 'roles'
  ): ReactElement => (
    <>
      <EmptyState variant="full">
        <EmptyStateHeader>{`No Ansible ${contentType}`}</EmptyStateHeader>
        <EmptyStateBody>{`Lifecycle Environment does not contain any Ansible ${contentType}`}</EmptyStateBody>
      </EmptyState>
    </>
  );

  return (
    <>
      <GridItem span={6} style={{ padding: '10px 10px 0px 0px' }}>
        <Card ouiaId="BasicCard" style={{ minWidth: '500px', height: '100%' }}>
          <CardTitle>Ansible collections</CardTitle>
          <CardBody>
            {lceCollections.length > 0 ? (
              <List isBordered style={{ height: '230px', overflowY: 'auto' }}>
                {lceCollections.map(collection => (
                  <ListItem key={collection.identifier}>
                    <Button
                      variant="link"
                      icon={<ExternalLinkSquareAltIcon />}
                      iconPosition="end"
                      onClick={() => {
                        const baseUrl = window.location.origin;
                        window.open(`${baseUrl}/ansible/content`, '_blank'); // TODO: filter by id
                      }}
                    >
                      {`${collection.identifier}: ${collection.version}`}
                    </Button>{' '}
                  </ListItem>
                ))}
              </List>
            ) : (
              emptyStateFor('collections')
            )}
          </CardBody>
        </Card>
      </GridItem>
      <GridItem span={6} style={{ padding: '10px 0px 0px 10px' }}>
        <Card ouiaId="BasicCard" style={{ minWidth: '500px', height: '100%' }}>
          <CardTitle>Ansible roles</CardTitle>
          <CardBody>
            {lceRoles.length > 0 ? (
              <List isBordered style={{ height: '230px', overflowY: 'auto' }}>
                {lceRoles.map(role => (
                  <ListItem key={role.identifier}>
                    <Button
                      variant="link"
                      icon={<ExternalLinkSquareAltIcon />}
                      iconPosition="end"
                      onClick={() => {
                        const baseUrl = window.location.origin;
                        window.open(`${baseUrl}/ansible/content`, '_blank'); // TODO: filter by id
                      }}
                    >
                      {`${role.identifier}: ${role.version}`}
                    </Button>{' '}
                  </ListItem>
                ))}
              </List>
            ) : (
              emptyStateFor('roles')
            )}
          </CardBody>
        </Card>
      </GridItem>
    </>
  );
};
