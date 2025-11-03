import React, { ReactElement } from 'react';
import AceEditor from 'react-ace';

interface YamlEditorProps {
  yamlFile: string;
  setYamlFile: (value: string) => void;
  height?: string;
  isReadOnly?: boolean;
}

export const YamlEditor = ({
  yamlFile,
  setYamlFile,
  height = '400px',
  isReadOnly = false,
}: YamlEditorProps): ReactElement => (
  // TODO: This needs a customized highlighter
  <AceEditor
    value={yamlFile}
    mode="yaml"
    onChange={setYamlFile}
    name="yaml-editor"
    theme="github"
    height={height}
    readOnly={isReadOnly}
    enableBasicAutocompletion
    enableSnippets
    width="100%"
  />
);
