import React, { Dispatch } from 'react';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as monaco from 'monaco-editor';
// eslint-disable-next-line import/no-extraneous-dependencies
import { loader } from '@monaco-editor/react';
import BlueprintIcon from '@patternfly/react-icons/dist/esm/icons/blueprint-icon';
import { Button, Tooltip } from '@patternfly/react-core';

loader.config({ monaco });

interface YamlEditorProps {
  yamlFile: string;
  setYamlFile: Dispatch<React.SetStateAction<string>>;
}

export const YamlEditor: React.FC<YamlEditorProps> = ({
  yamlFile,
  setYamlFile,
}) => {
  const template: string = '---\n\ncollections:\n\t- \n\nroles:\n\t- \n\n...';

  return (
    <>
      <CodeEditor
        code={yamlFile}
        isUploadEnabled
        isDownloadEnabled
        isCopyEnabled
        isLanguageLabelVisible
        isMinimapVisible
        language={Language.yaml}
        onChange={(value: string) => setYamlFile(value)}
        customControls={[
          <Tooltip
            content={
              <div>Start out with a basic requirements.yml template</div>
            }
          >
            <Button
              onClick={() => setYamlFile(template)}
              variant="control"
              aria-label="templateButtonAriaLabel"
            >
              <BlueprintIcon />
            </Button>
          </Tooltip>,
        ]}
        emptyStateTitle="Import content from an Ansible requirements file"
        emptyStateBody={
          <div>
            Upload a requirements.yml file.
            <br />
            <a href="https://docs.orcarhino.com">Syntax documentation</a>
          </div>
        }
        height="400px"
      />
    </>
  );
};
