import React, { ReactElement, useEffect } from 'react';
import {
  useForemanOrganization,
  useForemanLocation,
} from 'foremanReact/Root/Context/ForemanContext';
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';

import {
  Card,
  CardTitle,
  CardBody,
  CardFooter,
  Bullseye,
  ActionList,
  ActionListItem,
  Button,
  Form,
  TextVariants,
  TextContent,
  Text,
} from '@patternfly/react-core';

import axios, { AxiosResponse } from 'axios';
import { foremanUrl } from 'foremanReact/common/helpers';
import { addToast } from 'foremanReact/components/ToastsList';
import { useDispatch } from 'react-redux';

import { TaxonSelector } from './components/TaxonSelector';

interface ForceTaxonomyProps {
  organization?: boolean;
  location?: boolean;
  children: React.ReactNode;
}

export const ForceTaxonomy = ({
  organization,
  location = false,
  children = false,
}: ForceTaxonomyProps): ReactElement => {
  const [selectedOrganization, setSelectedOrganization] = React.useState<
    string
  >('');
  const [selectedLocation, setSelectedLocation] = React.useState<string>('');

  const currentOrganization = useForemanOrganization();
  const currentLocation = useForemanLocation();

  const organizationUpdateRequired =
    organization && currentOrganization === undefined;
  const locationUpdateRequired = location && currentLocation === undefined;

  useEffect(() => {
    if (organizationUpdateRequired && locationUpdateRequired) {
      document.title = _('Organization/Location required!');
    } else if (locationUpdateRequired) {
      document.title = _('Location required!');
    } else if (organizationUpdateRequired) {
      document.title = _('Organization required!');
    }
  }, [organizationUpdateRequired, locationUpdateRequired]);

  const dispatch = useDispatch();

  const card = (content: ReactElement): ReactElement => (
    <Bullseye>
      <Card ouiaId="BasicCard" style={{ minHeight: '30vh', minWidth: '50vh' }}>
        {content}
      </Card>
    </Bullseye>
  );

  const updateTaxonomy = async (): Promise<void> => {
    const updateTaxon = async ({
      type,
      endpoint,
    }: {
      type: 'organization' | 'location';
      endpoint: string;
    }): Promise<void> => {
      try {
        await axios.get(foremanUrl(endpoint));
        dispatch(
          addToast({
            type: 'success',
            key: `UPDATE_CURRENT_${type.toUpperCase()}_SUCC`,
            message: __(_('Successfully updated the current %(taxonType)s!'), {
              taxonType: type,
            }),
            sticky: false,
          })
        );
      } catch (e) {
        dispatch(
          addToast({
            type: 'danger',
            key: `UPDATE_CURRENT_${type.toUpperCase()}_ERR`,
            message: __(
              _(
                'Updating the current %(taxonType)s failed with error code "%(error)s".'
              ),
              {
                taxonType: type,
                error: (e as {
                  response: AxiosResponse;
                }).response.status,
              }
            ),
            sticky: false,
          })
        );
      }
    };

    await Promise.all([
      organizationUpdateRequired &&
        updateTaxon({
          type: 'organization',
          endpoint: `/organizations/${selectedOrganization}/select`,
        }),
      locationUpdateRequired &&
        updateTaxon({
          type: 'location',
          endpoint: `/locations/${selectedLocation}/select`,
        }),
    ]);

    // Unfortunately, the context is hydrated during the initial mounting of the root React App.
    // There is currently no mechanism to refresh it out of tree. Therefore, a reload is needed here.
    window.location.reload();
  };

  if (organizationUpdateRequired && locationUpdateRequired) {
    return card(
      <>
        <CardTitle>
          <TextContent>
            <Text component={TextVariants.h2}>
              {_('Select an organization and a location')}
            </Text>
          </TextContent>
        </CardTitle>
        <CardBody>
          <Form>
            <TaxonSelector
              type="organization"
              selected={selectedOrganization}
              onSelect={taxonId => setSelectedOrganization(taxonId)}
            />
            <TaxonSelector
              type="location"
              selected={selectedLocation}
              onSelect={taxonId => setSelectedLocation(taxonId)}
            />
          </Form>
        </CardBody>
        <CardFooter>
          <ActionList>
            <ActionListItem>
              <Button
                variant="primary"
                id="single-group-next-button"
                isDisabled={
                  selectedOrganization === '' || selectedLocation === ''
                }
                onClick={() => updateTaxonomy()}
              >
                {_('Save')}
              </Button>
            </ActionListItem>
          </ActionList>
        </CardFooter>
      </>
    );
  } else if (locationUpdateRequired) {
    return card(
      <>
        <CardTitle>
          <TextContent>
            <Text component={TextVariants.h2}>{_('Select a location')}</Text>
          </TextContent>
        </CardTitle>
        <CardBody>
          <Form>
            <TaxonSelector
              type="location"
              selected={selectedLocation}
              onSelect={taxonId => {
                setSelectedLocation(taxonId);
              }}
            />
          </Form>
        </CardBody>
        <CardFooter>
          <ActionList>
            <ActionListItem>
              <Button
                variant="primary"
                id="single-group-next-button"
                isDisabled={selectedLocation === ''}
                onClick={() => updateTaxonomy()}
              >
                {_('Save')}
              </Button>
            </ActionListItem>
          </ActionList>
        </CardFooter>
      </>
    );
  } else if (organizationUpdateRequired) {
    return card(
      <>
        <CardTitle>
          <TextContent>
            <Text component={TextVariants.h2}>
              {_('Select an organization')}
            </Text>
          </TextContent>
        </CardTitle>
        <CardBody>
          <Form>
            <TaxonSelector
              type="organization"
              selected={selectedOrganization}
              onSelect={taxonId => setSelectedOrganization(taxonId)}
            />
          </Form>
        </CardBody>
        <CardFooter>
          <ActionList>
            <ActionListItem>
              <Button
                variant="primary"
                id="single-group-next-button"
                isDisabled={selectedOrganization === ''}
                onClick={() => updateTaxonomy()}
              >
                {_('Save')}
              </Button>
            </ActionListItem>
          </ActionList>
        </CardFooter>
      </>
    );
  }

  return <>{children}</>;
};
