import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Modal, ModalVariant, Wizard, WizardHeader, WizardStep, Badge, TextVariants, TextContent, Text, } from '@patternfly/react-core';
import { ReviewStep } from './components/ReviewStep';
import ProviderSelectionStep from './components/ProviderSelectionStep';
import FinishFooter from './components/components/FinishFooter';
import { ContentUnitInput } from './components/components/ContentUnitInput';
import { YamlEditor } from './components/components/components/YamlEditor';
import { DefaultFooter } from './components/components/DefaultFooter';
const AnsibleContentWizard = () => {
    const [contentUnits, setContentUnits] = React.useState([]);
    const [yamlFile, setYamlFile] = React.useState('');
    const [provider, setProvider] = React.useState(undefined);
    const wizardSteps = () => {
        switch (provider) {
            case 'galaxy':
                return [
                    [
                        _jsx(WizardStep, { name: "Content Declaration", id: "declarationStep", footer: _jsx(DefaultFooter, { isBackDisabled: false, isNextDisabled: contentUnits.length < 1 }), children: _jsxs(_Fragment, { children: [_jsxs(TextContent, { children: [' ', _jsx(Text, { component: TextVariants.h2, children: "Declare content to import" })] }), _jsx(ContentUnitInput, { contentUnits: contentUnits, setContentUnits: setContentUnits })] }) }),
                        _jsx(WizardStep, { name: contentUnits.length > 0 ? (_jsxs(_Fragment, { children: ["Review ", _jsx(Badge, { children: contentUnits.length }, 1)] })) : ('Review'), id: "reviewStep", footer: _jsx(FinishFooter, { isFinishDisabled: contentUnits.length < 1, provider: "galaxy", contentUnits: contentUnits, yamlFile: yamlFile }), children: _jsxs(_Fragment, { children: [_jsxs(TextContent, { children: [' ', _jsx(Text, { component: TextVariants.h2, children: "Review content before importing" })] }), _jsx(ReviewStep, { contentUnits: contentUnits, setContentUnits: setContentUnits })] }) }),
                    ],
                ];
            case 'yaml':
                return (_jsx(WizardStep, { name: "Content Declaration", id: "declarationStep", footer: _jsx(FinishFooter, { isFinishDisabled: yamlFile === '', provider: "yaml", contentUnits: contentUnits, yamlFile: yamlFile }), children: _jsxs(_Fragment, { children: [_jsxs(TextContent, { children: [' ', _jsx(Text, { component: TextVariants.h2, children: "Declare Ansible content using a requirements file" })] }), _jsx(YamlEditor, { yamlFile: yamlFile, setYamlFile: setYamlFile })] }) }));
            default:
                return null;
        }
    };
    return (_jsx(React.Fragment, { children: _jsx(Modal, { variant: ModalVariant.large, showClose: false, isOpen: false, "aria-labelledby": "modal-wizard-label", "aria-describedby": "modal-wizard-description", onClose: () => { }, hasNoBodyWrapper: true, width: "60%", disableFocusTrap: true, children: _jsxs(Wizard, { startIndex: 1, header: _jsx(WizardHeader, { title: "Import Ansible content", titleId: "modal-wizard-label", onClose: () => { }, closeButtonAriaLabel: "Close wizard" }), onClose: () => { }, children: [_jsx(WizardStep, { name: "Provider Selection", id: "provider-selection-step", footer: _jsx(DefaultFooter, { isBackDisabled: true, isNextDisabled: provider === undefined }), children: _jsxs(_Fragment, { children: [_jsxs(TextContent, { children: [' ', _jsx(Text, { component: TextVariants.h2, children: "Select source of Ansible content" })] }), _jsx(ProviderSelectionStep, { provider: provider, setProvider: setProvider })] }) }), wizardSteps()] }) }) }));
};
export default AnsibleContentWizard;
