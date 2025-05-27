import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Button, Chip, ChipGroup, FormGroup, FormHelperText, HelperText, HelperTextItem, InputGroup, InputGroupItem, Popover, TextInput, ValidatedOptions, } from '@patternfly/react-core';
import PlusIcon from '@patternfly/react-icons/dist/esm/icons/plus-icon';
import styles from '@patternfly/react-styles/css/components/Form/form';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
export const VersionInput = ({ contentUnitVersions, setContentUnitVersions, }) => {
    const [versionInput, setVersionInput] = React.useState('');
    const [versionInputValidation, setVersionInputValidation] = React.useState(ValidatedOptions.default);
    const handleVersionAdd = () => {
        const versions = versionInput
            .split(',')
            .map(version => version.trim());
        setContentUnitVersions(oldVersions => [...oldVersions, ...versions]);
        setVersionInput('');
    };
    const handleVersionInput = (_event, value) => {
        let validationState = ValidatedOptions.success;
        if (!new RegExp('^(\\d+(\\.\\d+)*)(,\\s?(\\d+(\\.\\d+)*))*$').test(value)) {
            validationState = ValidatedOptions.error;
        }
        setVersionInputValidation(validationState);
        setVersionInput(value);
    };
    return (_jsxs(FormGroup, { label: "Collection versions", labelIcon: _jsx(Popover, { headerContent: _jsx("div", { children: "A subset of versions to import." }), bodyContent: _jsx("div", { children: "If left empty, all available versions will be imported. Versions are not checked for validity. Invalid versions will cause failure of the importer." }), children: _jsx("button", { type: "button", "aria-label": "More info for unit id field", onClick: e => e.preventDefault(), "aria-describedby": "content-unit-identifier-field-01", className: styles.formGroupLabelHelp, children: _jsx(HelpIcon, {}) }) }), children: [_jsxs(InputGroup, { children: [_jsx(InputGroupItem, { isFill: true, children: _jsx(TextInput, { validated: versionInputValidation, value: versionInput, onChange: handleVersionInput, onKeyDown: event => event.key === 'Enter' &&
                                versionInputValidation === ValidatedOptions.success
                                ? handleVersionAdd()
                                : null, id: "cu-source-input-01", type: "text", "aria-label": "content unit source input" }) }), _jsx(InputGroupItem, { children: _jsx(Button, { variant: "control", onClick: handleVersionAdd, children: _jsx(PlusIcon, {}) }) })] }), versionInputValidation === ValidatedOptions.error && (_jsx(FormHelperText, { children: _jsx(HelperText, { children: _jsx(HelperTextItem, { children: 'Version list does not conform to the pattern: "<version>, <version>"' }) }) })), _jsx(ChipGroup, { categoryName: "Only import: ", numChips: 10, children: contentUnitVersions.map(unitVersion => (_jsx(Chip, { onClick: () => setContentUnitVersions(oldVersions => oldVersions.filter(v => v !== unitVersion)), children: unitVersion }, unitVersion))) })] }));
};
