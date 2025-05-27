import { jsx as _jsx } from "react/jsx-runtime";
import { useWizardContext, WizardFooter } from '@patternfly/react-core';
export const DefaultFooter = ({ isBackDisabled, isNextDisabled, }) => {
    const { activeStep, goToNextStep, goToPrevStep, close } = useWizardContext();
    return (_jsx(WizardFooter, { activeStep: activeStep, onNext: goToNextStep, onBack: goToPrevStep, onClose: close, isBackDisabled: isBackDisabled, isNextDisabled: isNextDisabled }));
};
