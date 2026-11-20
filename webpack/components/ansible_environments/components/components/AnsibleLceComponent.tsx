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

import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';

import { AnsibleLceComponentHeaderActions } from './AnsibleLceComponentHeaderActions';
import { AnsibleLce } from '../../../../types/AnsibleEnvironmentsTypes';
import { useToasts } from '../../../../helpers/toasts/useToasts';
import { LifecycleEnvironment } from '../../../../resources/clients/LifecycleEnvironment';

interface AnsibleLceComponentProps {
  lce: AnsibleLce;
  pathEditMode: boolean;
  refreshRequest: () => void;
  setLifecycleEnv: Dispatch<SetStateAction<AnsibleLce | undefined>>;
  setIsContentUnitModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsConfirmationModalOpen: Dispatch<React.SetStateAction<boolean>>;
  setConfirmationModalTitle: Dispatch<React.SetStateAction<string>>;
  setConfirmationModalBody: Dispatch<React.SetStateAction<string>>;
  setConfirmationModalOnConfirm: Dispatch<React.SetStateAction<() => void>>;
  setIsExecutionEnvModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const AnsibleLceComponent: React.FC<AnsibleLceComponentProps> = ({
  lce,
  pathEditMode,
  refreshRequest,
  setLifecycleEnv,
  setIsContentUnitModalOpen,
  setIsConfirmationModalOpen,
  setConfirmationModalTitle,
  setConfirmationModalBody,
  setConfirmationModalOnConfirm,
  setIsExecutionEnvModalOpen,
}) => {
  const [editMode, setEditMode] = React.useState<boolean>(false);
  const [lifecycleEnvironment, setLifecycleEnvironment] = React.useState<
    AnsibleLce
  >();

  useEffect(() => {
    setLifecycleEnvironment(lce);
  }, [lce]);

  const { withToast } = useToasts();

  const handleLceUpdate = (): void => {
    if (editMode) {
      if (JSON.stringify(lce) !== JSON.stringify(lifecycleEnvironment)) {
        setIsConfirmationModalOpen(true);
        setConfirmationModalTitle(`Update "${lce.name}"?`);
        setConfirmationModalBody('');
        setConfirmationModalOnConfirm(() => async () => {
          await updateLce(lce);
        });
      }
    }
    setEditMode(!editMode);
  };

  const handleDestroy = (): void => {
    setIsConfirmationModalOpen(true);
    setConfirmationModalTitle(`Delete "${lce.name}"?`);
    setConfirmationModalBody('');
    setConfirmationModalOnConfirm(() => async () => {
      await destroyLce(lce);
    });
  };

  const updateLce = async (env: AnsibleLce): Promise<void> => {
    await withToast({
      type: 'update',
      resource: 'lifecycle_environment',
      func: LifecycleEnvironment.updatePartial(env.id, {
        lifecycle_environment: {
          name: lifecycleEnvironment?.name,
        },
      }),
    });
    refreshRequest();
  };

  const destroyLce = async (lceRef: AnsibleLce): Promise<void> => {
    await withToast({
      type: 'delete',
      resource: 'lifecycle_environment',
      func: LifecycleEnvironment.destroy(lceRef.id),
    });
    refreshRequest();
  };

  const contentUnitCountString = (lceObj: AnsibleLce): string => {
    if (lceObj.content.length === 1) {
      return _('1 content unit');
    }
    return __(_('%(count)s content units'), {
      count: lceObj.content.length,
    });
  };

  const handleEditContent = async (): Promise<void> => {
    setLifecycleEnv(lce);
    setIsContentUnitModalOpen(true);
  };

  const handleEditExecutionEnv = async (): Promise<void> => {
    setLifecycleEnv(lce);
    setIsExecutionEnvModalOpen(true);
  };

  // eslint-disable-next-line @stylistic/multiline-ternary
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
              handleEdit={handleLceUpdate}
              handleDestroy={handleDestroy}
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
              {_('Execution Environment:')}
              <Button
                onClick={handleEditExecutionEnv}
                component="a"
                isInline
                variant="link"
                iconPosition="end"
              >
                {lifecycleEnvironment.execution_environment
                  ? lifecycleEnvironment.execution_environment.name
                  : 'None'}
              </Button>
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
              isDisabled
            >
              {contentUnitCountString(lifecycleEnvironment)}
            </Button>
          </SplitItem>
        </Split>
      </CardBody>
    </Card>
  ) : null;
};
