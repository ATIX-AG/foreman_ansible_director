import React, { Dispatch, SetStateAction, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Split,
  SplitItem,
  TextInput,
} from '@patternfly/react-core';

import ExternalLinkSquareAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-square-alt-icon';
import { AnsibleLceComponentHeaderActions } from './AnsibleLceComponentHeaderActions';
import { AnsibleLce } from '../../../../types/AnsibleEnvironmentsTypes';

interface AnsibleLceComponentProps {
  lce: AnsibleLce;
  pathEditMode: boolean;
  setLifecycleEnv: Dispatch<SetStateAction<AnsibleLce | undefined>>;
  setIsContentUnitModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const AnsibleLceComponent: React.FC<AnsibleLceComponentProps> = ({
  lce,
  pathEditMode,
  setLifecycleEnv,
  setIsContentUnitModalOpen,
}) => {
  const [editMode, setEditMode] = React.useState<boolean>(false);
  const [lifecycleEnvironment, setLifecycleEnvironment] = React.useState<
    AnsibleLce
  >();

  useEffect(() => {
    setLifecycleEnvironment(lce);
  }, [lce]);

  const askConfirmUpdate = async (): Promise<void> => {
    if (editMode) {
      if (JSON.stringify(lce) !== JSON.stringify(lifecycleEnvironment)) {
        // TODO: update
        console.log(lifecycleEnvironment);
      }
    }
    setEditMode(!editMode);
  };

  const handleEditContent = async (): Promise<void> => {
    setLifecycleEnv(lce);
    setIsContentUnitModalOpen(true);
  };

  return lifecycleEnvironment ? (
    <Card
      style={{
        flex: 1,
        margin: 0,
        minWidth: 'max-content',
        boxShadow: 'var(--pf-v5-global--BoxShadow--lg)',
      }}
      isRounded
    >
      <CardHeader
        actions={{
          actions: (
            <AnsibleLceComponentHeaderActions
              lce={lce}
              pathEditMode={pathEditMode}
              editMode={editMode}
              handleEdit={askConfirmUpdate}
              handleDestroy={() => {}}
              handleEditContent={handleEditContent}
            />
          ),
          hasNoOffset: true,
        }}
      >
        <TextInput
          style={{
            fontSize: 'var(--pf-v5-global--FontSize--md)',
            fontWeight: 'var(--pf-v5-global--FontWeight--medium)',
            fontFamily: 'var(--pf-v5-global--FontFamily--heading)',
            lineHeight: 'var(--pf-v5-global--LineHeight--medium)',
          }}
          className="pf-v5-c-card__title-text"
          value={lifecycleEnvironment.name}
          onChange={(_event, value: string) => {
            setLifecycleEnvironment({
              ...lifecycleEnvironment,
              name: value,
            });
          }}
          type="text"
          readOnlyVariant={editMode ? undefined : 'plain'}
        />
      </CardHeader>
      <CardBody>
        <Split>
          <SplitItem>
            <div
              style={{
                fontSize: 'var(--pf-global--FontSize--xs)',
                color: 'var(--pf-global--Color--200)',
              }}
            >
              EE:{' '}
              {lifecycleEnvironment.execution_environment ? (
                <Button
                  onClick={(event: React.MouseEvent) => event.preventDefault()}
                  component="a"
                  isInline
                  variant="link"
                  href={`/ansible/execution_environments/${lifecycleEnvironment.execution_environment.id}/`}
                  icon={<ExternalLinkSquareAltIcon />}
                  iconPosition="end"
                >
                  {lifecycleEnvironment.execution_environment.name}
                </Button>
              ) : (
                'None'
              )}
            </div>
          </SplitItem>
          <SplitItem isFilled />
          <SplitItem>
            <Button
              // Preventing default click behavior for example purposes only
              onClick={(event: React.MouseEvent) => event.preventDefault()}
              component="a"
              isInline
              variant="link"
            >
              {`${lifecycleEnvironment.content.length} content units`}
            </Button>
          </SplitItem>
        </Split>
      </CardBody>
    </Card>
  ) : null;
};
