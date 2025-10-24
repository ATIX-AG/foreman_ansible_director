import React, { ReactElement } from 'react';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { editor } from 'monaco-editor';
import { Monaco } from '@monaco-editor/react';

interface YamlAdapterProps {
  isEditMode: boolean;
  value: string;
  onChange: (value: string) => void;
}

export const YamlAdapter = ({
  isEditMode,
  value,
  onChange,
}: YamlAdapterProps): ReactElement => {
  const onEditorDidMount = (
    passedEditor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ): void => {
    passedEditor.layout();
    passedEditor.focus();
    monaco.editor.getModels()[0].updateOptions({ tabSize: 5 });
  };

  return (
    <CodeEditor
      isLineNumbersVisible
      isReadOnly={!isEditMode}
      isMinimapVisible
      isLanguageLabelVisible
      code={String(value)}
      onChange={onChange}
      language={Language.yaml}
      onEditorDidMount={onEditorDidMount}
      height="300px"
    />
  );
};
