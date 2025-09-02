import React, { ReactElement } from 'react';
import {
  Form,
  FormGroup,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  MenuToggleElement,
  Flex,
  FlexItem,
  Card,
  CardTitle,
  CardBody,
  GridItem,
  Grid,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Button,
} from '@patternfly/react-core';
import ExternalLinkSquareAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-square-alt-icon';
import CubesIcon from '@patternfly/react-icons/dist/esm/icons/cube-icon';
import { LceContentListWrapper } from './LceContentListWrapper';
import {
  AnsibleLcePath,
  SparseAnsibleLce,
} from '../../../../../types/AnsibleEnvironmentsTypes';

interface LcePathSelectorProps {
  lcePaths: AnsibleLcePath[];
  // selectedLcePath: string | undefined;
  // setSelectedLcePath: Dispatch<SetStateAction<string | undefined>>;
}

export const LcePathSelector = ({
  lcePaths,
}: // selectedLcePath,
// setSelectedLcePath,
LcePathSelectorProps): React.ReactElement => {
  const LCE_PATH_SELECTOR_PLACEHOLDER = 'Select an LCE Path';
  const LCE_SELECTOR_PLACEHOLDER = 'Select an LCE';

  const [isLcePathToggleOpen, setIsLcePathToggleOpen] = React.useState<boolean>(
    false
  );
  const [isLceToggleOpen, setIsLceToggleOpen] = React.useState<boolean>(false);

  const [selectedLcePath, setSelectedLcePath] = React.useState<
    string | undefined
  >(LCE_PATH_SELECTOR_PLACEHOLDER);

  const [selectedLce, setSelectedLce] = React.useState<string>(
    LCE_SELECTOR_PLACEHOLDER
  );

  const lcePathSelectToggle = (
    toggleRef: React.Ref<MenuToggleElement>
  ): ReactElement => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsLcePathToggleOpen(!isLcePathToggleOpen)}
      isExpanded={isLcePathToggleOpen}
      isDisabled={false}
      style={
        {
          width: '200px',
        } as React.CSSProperties
      }
    >
      {selectedLcePath}
    </MenuToggle>
  );

  const lceSelectToggle = (
    toggleRef: React.Ref<MenuToggleElement>
  ): ReactElement => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsLceToggleOpen(!isLcePathToggleOpen)}
      isExpanded={isLceToggleOpen}
      isDisabled={selectedLcePath === LCE_PATH_SELECTOR_PLACEHOLDER}
      style={
        {
          width: '200px',
        } as React.CSSProperties
      }
    >
      {selectedLce}
    </MenuToggle>
  );

  const executionEnvironmentBody = (): ReactElement => {
    const lce = lceForName(selectedLce);
    console.log(lce);
    if (lce.execution_environment) {
      return (
        <Button
          variant="link"
          icon={<ExternalLinkSquareAltIcon />}
          iconPosition="end"
          onClick={() => {
            const baseUrl = window.location.origin;
            window.open(`${baseUrl}/ansible/execution_environments`, '_blank'); // TODO: filter by id
          }}
        >
          {lce.execution_environment.name}
        </Button>
      );
    }
    return (
      <Button
        variant="link"
        icon={<ExternalLinkSquareAltIcon />}
        iconPosition="end"
        onClick={() => {
          const baseUrl = window.location.origin;
          window.open(`${baseUrl}/ansible/execution_environments`, '_blank'); // TODO: get default id from context
        }}
      >
        Default
      </Button>
    );
  };

  const lceForName = (
    name: string
  ): SparseAnsibleLce => // TODO: I know this can be done better, but I'm too lazy to deal with it right now.'
    lcePaths
      .filter(lcePath => lcePath.name === selectedLcePath)[0]
      .lifecycle_environments.filter(lce => lce.name === name)[0];

  return (
    <Flex style={{ height: '100%', padding: '20px' }}>
      <FlexItem
        style={{
          flex: '25 0 0%',
          height: '100%',
          margin: 0,
          padding: '0px 10px 0px 0px',
        }}
      >
        <Card ouiaId="BasicCard" style={{ height: '100%' }}>
          <CardTitle>Select Lifecycle Environment</CardTitle>
          <CardBody>
            <Form>
              <FormGroup label="Lifecycle Environment Path">
                <Select
                  id="single-select"
                  isOpen={isLcePathToggleOpen}
                  selected="Option 1"
                  onSelect={(event?, value?) => {
                    setSelectedLcePath(value as string);
                    setIsLcePathToggleOpen(false);
                  }}
                  onOpenChange={() => {
                    setIsLcePathToggleOpen(!isLcePathToggleOpen);
                  }}
                  toggle={lcePathSelectToggle}
                  shouldFocusToggleOnSelect
                >
                  <SelectList>
                    {lcePaths.map(lcePath => (
                      <SelectOption key={lcePath.id} value={lcePath.name}>
                        {lcePath.name}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
              </FormGroup>
              <FormGroup label="Lifecycle Environment">
                <Select
                  id="single-select"
                  isOpen={isLceToggleOpen}
                  selected="Option 1"
                  onSelect={(event?, value?) => {
                    setSelectedLce(value as string);
                    setIsLceToggleOpen(false);
                  }}
                  onOpenChange={() => {
                    setIsLceToggleOpen(!isLceToggleOpen);
                  }}
                  toggle={lceSelectToggle}
                  shouldFocusToggleOnSelect
                >
                  {selectedLcePath !== LCE_PATH_SELECTOR_PLACEHOLDER && (
                    <SelectList>
                      {lcePaths
                        .filter(lcePath => lcePath.name === selectedLcePath)[0]
                        .lifecycle_environments.map(lce => (
                          <SelectOption key={lce.id} value={lce.name}>
                            {lce.name}
                          </SelectOption>
                        ))}
                    </SelectList>
                  )}
                </Select>
              </FormGroup>
            </Form>
          </CardBody>
        </Card>
      </FlexItem>
      <FlexItem style={{ flex: '75 0 0%', padding: '0px 0px 0px 10px' }}>
        {selectedLce !== LCE_SELECTOR_PLACEHOLDER ? (
          <Grid>
            <GridItem span={12} style={{ padding: '0px 0px 10px 0px' }}>
              <Card>
                <CardTitle>Execution Environment</CardTitle>
                <CardBody>{executionEnvironmentBody()}</CardBody>
              </Card>
            </GridItem>
            <LceContentListWrapper lceId={lceForName(selectedLce).id} />
          </Grid>
        ) : (
          <Card style={{ height: '460px' }}>
            <CardTitle>No Lifecycle Environment selected</CardTitle>
            <CardBody>
              <EmptyState>
                <EmptyStateHeader
                  titleText="Select a Lifecycle Environment to preview content"
                  headingLevel="h4"
                  icon={<EmptyStateIcon icon={CubesIcon} />}
                />
              </EmptyState>
            </CardBody>
          </Card>
        )}
      </FlexItem>
    </Flex>
  );
};
