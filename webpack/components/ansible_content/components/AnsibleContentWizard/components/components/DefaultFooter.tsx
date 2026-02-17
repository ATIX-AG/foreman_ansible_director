import React from 'react';
import { useWizardContext, WizardFooter } from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';

interface DefaultFooterProps {
  isBackDisabled: boolean;
  isNextDisabled: boolean;
}

export const DefaultFooter: React.FC<DefaultFooterProps> = ({
  isBackDisabled,
  isNextDisabled,
}) => {
  const { activeStep, goToNextStep, goToPrevStep, close } = useWizardContext();

  return (
    <WizardFooter
      activeStep={activeStep}
      onNext={goToNextStep}
      onBack={goToPrevStep}
      onClose={close}
      isBackDisabled={isBackDisabled}
      isNextDisabled={isNextDisabled}
      nextButtonText={_('Next')}
      backButtonText={_('Back')}
      cancelButtonText={_('Cancel')}
    />
  );
};
