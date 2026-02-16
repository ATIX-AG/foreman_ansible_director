import React from 'react';
import { usePermissions } from 'foremanReact/common/hooks/Permissions/permissionHooks';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PermittedButton } from '../PermittedButton';

jest.mock('foremanReact/common/hooks/Permissions/permissionHooks', () => ({
  usePermissions: jest.fn(),
}));

const usePermissionsMock = usePermissions as jest.MockedFunction<
  typeof usePermissions
>;

describe('PermittedButton', () => {
  it('renders an enabled button when user has permissions', () => {
    usePermissionsMock.mockImplementation(() => true);

    render(<PermittedButton requiredPermissions={[]} />);

    expect(screen.getByTestId('permitted-button')).toHaveAttribute(
      'aria-disabled',
      'false'
    );
  });

  it('renders a disabled button when user does not have permissions', () => {
    usePermissionsMock.mockImplementation(() => false);

    render(<PermittedButton requiredPermissions={[]} />);

    expect(screen.getByTestId('permitted-button')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('renders the errorPopover when hasErrorPopover is true', async () => {
    usePermissionsMock.mockImplementation(() => false);

    render(<PermittedButton requiredPermissions={['TEST_PERMISSION']} />);

    const button = screen.getByTestId('permitted-button');

    await act(async () => {
      fireEvent.mouseEnter(button);
    });

    expect(screen.getByText('Permission missing')).toBeInTheDocument();
    expect(screen.getByText('TEST_PERMISSION')).toBeInTheDocument();
  });

  it('renders no errorPopover when hasErrorPopover is false', async () => {
    usePermissionsMock.mockImplementation(() => false);

    render(
      <PermittedButton
        requiredPermissions={['TEST_PERMISSION']}
        hasErrorPopover={false}
      />
    );

    const button = screen.getByTestId('permitted-button');

    await act(async () => {
      fireEvent.mouseEnter(button);
    });

    expect(screen.queryByText('Permission missing')).not.toBeInTheDocument();
    expect(screen.queryByText('TEST_PERMISSION')).not.toBeInTheDocument();
  });

  it('renders a custom popover when popoverProps are given', async () => {
    usePermissionsMock.mockImplementation(() => true);

    const { getByTestId } = render(
      <PermittedButton
        requiredPermissions={['TEST_PERMISSION']}
        hasErrorPopover={false}
        hasPopover
        popoverProps={{
          triggerAction: 'hover',
          'aria-label': 'test popover',
          headerComponent: 'h1',
          headerContent: 'TEST',
          bodyContent: <div>TEST_POPOVER_CONTENT</div>,
        }}
      />
    );

    const button = getByTestId('permitted-button');

    await act(async () => {
      fireEvent.mouseEnter(button);
    });

    expect(screen.queryByText('TEST')).toBeInTheDocument();
    expect(screen.queryByText('TEST_POPOVER_CONTENT')).toBeInTheDocument();
  });
});
