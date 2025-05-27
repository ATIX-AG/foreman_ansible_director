import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { CodeEditor, Language } from '@patternfly/react-code-editor';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as monaco from 'monaco-editor';
// eslint-disable-next-line import/no-extraneous-dependencies
import { loader } from '@monaco-editor/react';
import BlueprintIcon from '@patternfly/react-icons/dist/esm/icons/blueprint-icon';
import { Button, Tooltip } from '@patternfly/react-core';
loader.config({ monaco });
export const YamlEditor = ({ yamlFile, setYamlFile, }) => {
    const template = '---\n\ncollections:\n\t- \n\nroles:\n\t- \n\n...';
    return (_jsx(_Fragment, { children: _jsx(CodeEditor, { code: yamlFile, isUploadEnabled: true, isDownloadEnabled: true, isCopyEnabled: true, isLanguageLabelVisible: true, isMinimapVisible: true, language: Language.yaml, onChange: (value) => setYamlFile(value), customControls: [
                _jsx(Tooltip, { content: _jsx("div", { children: "Start out with a basic requirements.yml template" }), children: _jsx(Button, { onClick: () => setYamlFile(template), variant: "control", "aria-label": "templateButtonAriaLabel", children: _jsx(BlueprintIcon, {}) }) }),
            ], emptyStateTitle: "Import content from an Ansible requirements file", emptyStateBody: _jsxs("div", { children: ["Upload a requirements.yml file.", _jsx("br", {}), _jsx("a", { children: "Bla Bla Docs URL" })] }), height: "400px" }) }));
};
