import React from 'react';
import { useWizardContext, WizardFooter } from '@patternfly/react-core';

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
    />
  );
};
