declare module 'foremanReact/routes/common/EmptyPage' {
  import React from 'react';

  interface Message {
    type: 'empty' | 'error' | 'loading';
    text: string;
    action?: object;
  }

  interface EmptyPageProps {
    message: Message;
  }

  const EmptyPage: (props: EmptyPageProps) => React.JSX.Element;
  export default EmptyPage;
}
