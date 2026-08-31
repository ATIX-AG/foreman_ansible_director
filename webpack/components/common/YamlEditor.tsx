import React, { forwardRef } from 'react';
import AceEditor from 'react-ace';
import ReactAce from 'react-ace';

interface YamlEditorProps {
  yamlFile: string;
  setYamlFile: (value: string) => void;
  height?: string;
  isReadOnly?: boolean;
}

export const YamlEditor = forwardRef<ReactAce, YamlEditorProps>((props, ref) => {
  const {
    yamlFile,
    setYamlFile,
    height = '400px',
    isReadOnly = false,
  } = props;

  return (
  // TODO: This needs a customized highlighter
    <AceEditor
      ref={ref}
      style={{
        maxHeight: '18rem',
        fontFamily: 'monospace',
      }}
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
});
