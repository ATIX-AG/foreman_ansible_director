import React, { ReactElement } from 'react';
import { Button, CodeBlock, CodeBlockCode, Modal, ModalVariant } from '@patternfly/react-core';
import { translate as _ } from 'foremanReact/common/I18n';
import { YamlParserErrorState } from './YamlParserErrorState';

interface YamlErrorStateProps {
  error: Error;
}

export const YamlErrorState = ({ error }: YamlErrorStateProps): ReactElement => {

  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);

  return (
    <>
      <YamlParserErrorState
        onInspectClick={() => setIsModalOpen(true)}
      />
      <Modal
        variant={ModalVariant.medium}
        title={'YAML parsing error'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        actions={[
          <Button
            key="ok"
            variant="primary"
            onClick={() => setIsModalOpen(false)}
          >
            {_('OK')}
          </Button>,
        ]}
      >
        <CodeBlock>
          <CodeBlockCode id="code-content">{error.message}</CodeBlockCode>
        </CodeBlock>
      </Modal>
    </>
  );
};
