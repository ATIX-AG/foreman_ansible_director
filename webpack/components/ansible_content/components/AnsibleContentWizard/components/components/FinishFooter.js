import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useState } from 'react';
import axios from 'axios';
import { foremanUrl } from 'foremanReact/common/helpers';
import { WizardFooter, useWizardContext } from '@patternfly/react-core';
const FinishFooter = ({ isFinishDisabled, provider, contentUnits, yamlFile, }) => {
    const [loading, setLoading] = useState(false);
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (provider === 'yaml') {
                await axios.post(foremanUrl('/api/v2/pulsible/ansible_content/from_yaml'), {
                    requirements_file: btoa(encodeURIComponent(yamlFile)),
                });
            }
            else if (provider === 'galaxy') {
                await axios.post(foremanUrl('/api/v2/pulsible/ansible_content'), {
                    units: contentUnits.map(unit => ({
                        unit_name: unit.identifier,
                        unit_type: unit.type,
                        unit_source: unit.source,
                        unit_versions: unit.versions.map(versionObj => versionObj.version),
                    })),
                });
            }
        }
        catch (err) {
            // TODO: Error Popup
        }
        finally {
            setLoading(false);
        }
    }, [contentUnits, provider, yamlFile]);
    const { activeStep, goToPrevStep, close } = useWizardContext();
    return (_jsx(WizardFooter, { isNextDisabled: isFinishDisabled, nextButtonText: "Finish", activeStep: activeStep, nextButtonProps: {
            spinnerAriaValueText: 'Loading',
            spinnerAriaLabelledBy: 'primary-loading-button',
            isLoading: loading,
        }, onNext: fetchData, onBack: goToPrevStep, onClose: close }));
};
export default FinishFooter;
