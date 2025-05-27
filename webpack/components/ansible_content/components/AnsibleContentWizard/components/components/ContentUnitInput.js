import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { ActionGroup, Button, Form, FormGroup, FormHelperText, HelperText, HelperTextItem, InputGroup, InputGroupItem, Popover, Radio, TextInput, ValidatedOptions, } from '@patternfly/react-core';
import UndoIcon from '@patternfly/react-icons/dist/esm/icons/undo-icon';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import PlusIcon from '@patternfly/react-icons/dist/esm/icons/plus-icon';
import styles from '@patternfly/react-styles/css/components/Form/form';
import { VersionInput } from './components/VersionInput';
export const ContentUnitInput = ({ contentUnits, setContentUnits, }) => {
    const defaultGalaxy = 'https://galaxy.ansible.com/'; // TODO: Extract this from context; Assume valid
    const [contentUnitName, setContentUnitName] = React.useState('');
    const [contentUnitValidation, setContentUnitValidation] = React.useState(ValidatedOptions.default);
    const [contentUnitValidationHelperText, setContentUnitValidationHelperText,] = React.useState('');
    const [contentUnitSource, setContentUnitSource] = React.useState(defaultGalaxy); // TODO: Global default
    const [contentUnitSourceValidation, setContentUnitSourceValidation,] = React.useState(ValidatedOptions.success);
    const [contentUnitVersions, setContentUnitVersions] = React.useState([]);
    const [unitType, setUnitType] = React.useState('collection');
    const handleUnitTypeChange = (_event) => {
        if (unitType === 'collection') {
            setUnitType('role');
        }
        else {
            setUnitType('collection');
        }
    };
    const handleNameChange = (_event, name) => {
        let helperText;
        let validationState;
        if (name === '') {
            helperText = `${unitType === 'collection' ? 'Collection' : 'Role'} identifier may not be empty!`;
            validationState = ValidatedOptions.error;
        }
        else if (!new RegExp('^[a-z]+\\.[a-z]+$').test(name)) {
            helperText = `${unitType === 'collection' ? 'Collection' : 'Role'} identifier does not match /^[a-z]+\\.[a-z]+$/!`;
            validationState = ValidatedOptions.error;
        }
        else if (contentUnits.some(unit => unit.identifier === name && unit.type === unitType)) {
            helperText = `${unitType === 'collection' ? 'Collection' : 'Role'} already in batch. If version sets differ, their union will be used!`;
            validationState = ValidatedOptions.warning;
        }
        else {
            validationState = ValidatedOptions.success;
            helperText = '';
        }
        setContentUnitName(name);
        setContentUnitValidation(validationState);
        setContentUnitValidationHelperText(helperText);
    };
    const handleUnitSourceChange = (_event, sourceUrl) => {
        const validSource = new RegExp('^https?:\\/\\/.*\\/$').test(sourceUrl);
        setContentUnitSourceValidation(validSource ? ValidatedOptions.success : ValidatedOptions.error);
        setContentUnitSource(sourceUrl);
    };
    const addToBatch = (_event) => {
        const unit = {
            type: unitType,
            identifier: contentUnitName,
            source: contentUnitSource,
            versions: contentUnitVersions.map(versionString => ({
                version: versionString,
            })),
        };
        setContentUnitName('');
        setContentUnitValidation(ValidatedOptions.default);
        setContentUnitValidationHelperText('');
        setContentUnitVersions([]);
        setContentUnits(oldUnits => [...oldUnits, unit]);
    };
    return (_jsxs(Form, { children: [_jsxs(FormGroup, { role: "radiogroup", fieldId: "basic-form-radio-group", label: "Unit type", isInline: true, children: [_jsx(Radio, { isChecked: unitType === 'collection', name: "collection-radio", onChange: handleUnitTypeChange, label: "Collection", id: "collection-radio-01" }), _jsx(Radio, { isChecked: unitType === 'role', name: "role-radio", onChange: handleUnitTypeChange, label: "Role", id: "role-radio-01" })] }), _jsxs(FormGroup, { label: `${unitType === 'collection' ? 'Collection' : 'Role'} Indentifier`, isRequired: true, fieldId: "content-unit-form-01", labelIcon: _jsx(Popover, { headerContent: _jsxs("div", { children: ["The identifier of an Ansible ", unitType, "."] }), bodyContent: _jsx("div", { children: "$namespace.$name" }), children: _jsx("button", { type: "button", "aria-label": "More info for unit id field", onClick: e => e.preventDefault(), "aria-describedby": "content-unit-identifier-field-01", className: styles.formGroupLabelHelp, children: _jsx(HelpIcon, {}) }) }), children: [_jsx(TextInput, { isRequired: true, type: "text", id: "content-unit-id-input-01", value: contentUnitName, onChange: handleNameChange, validated: contentUnitValidation }), contentUnitValidation === ValidatedOptions.error && (_jsx(FormHelperText, { children: _jsx(HelperText, { children: _jsx(HelperTextItem, { children: contentUnitValidationHelperText }) }) }))] }), _jsxs(FormGroup, { label: `${unitType === 'collection' ? 'Collection' : 'Role'} Source`, fieldId: "cu-source-01", children: [_jsxs(InputGroup, { children: [_jsx(InputGroupItem, { isFill: true, children: _jsx(TextInput, { value: contentUnitSource, onChange: handleUnitSourceChange, id: "cu-source-input-01", type: "text", "aria-label": "content unit source input", validated: contentUnitSourceValidation }) }), _jsx(InputGroupItem, { children: _jsx(Button, { variant: "control", "aria-label": "popover for input", onClick: () => {
                                        setContentUnitSource(defaultGalaxy);
                                        setContentUnitSourceValidation(ValidatedOptions.success);
                                    } // TODO: Global parameter
                                    , children: _jsx(UndoIcon, {}) }) })] }), contentUnitSourceValidation === ValidatedOptions.error && (_jsx(FormHelperText, { children: _jsx(HelperText, { children: _jsx(HelperTextItem, { children: `${unitType === 'collection' ? 'Collection' : 'Role'} source does not match /^https?:\\/\\/.*\\/$/!` }) }) }))] }), unitType === 'collection' && (_jsx(VersionInput, { contentUnitVersions: contentUnitVersions, setContentUnitVersions: setContentUnitVersions })), _jsxs(ActionGroup, { children: [_jsxs(Button, { isDisabled: contentUnitValidation !== ValidatedOptions.success ||
                            contentUnitSourceValidation !== ValidatedOptions.success, variant: "primary", icon: _jsx(PlusIcon, {}), ouiaId: "PrimaryWithIcon", onClick: addToBatch, children: [`Add ${unitType === 'collection' ? 'Collection' : 'Role'} to batch`, ' '] }), ' '] })] }));
};
