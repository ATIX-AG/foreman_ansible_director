import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { Permitted } from '../Permitted';

const testString = 'Unambiguous test string';
const unPermittedTestString = 'Unambiguous unpermitted test string';
const permissionString = 'test_permission_one';
const permissionsArray = [permissionString, 'test_permission_two'];
const invalidPermissionString = 'some_other_permission_one';
const invalidPermissionsArray = [
  invalidPermissionString,
  'some_other_permission_two',
];

jest.mock('foremanReact/Root/Context/ForemanContext', () => ({
  useForemanPermissions: () =>
    new Set(['test_permission_one', 'test_permission_two']),
}));

describe('Permitted', () => {
  describe('component', () => {
    it('renders the component if a single permission is required', () => {
      const { queryByText } = render(
        <Permitted requiredPermissions={[permissionString]}>
          {testString}
        </Permitted>
      );

      const testElement = queryByText(testString);
      expect(testElement).toBeInTheDocument();
    });
    it('renders the component if multiple permissions are required', () => {
      const { queryByText } = render(
        <Permitted requiredPermissions={permissionsArray}>
          {testString}
        </Permitted>
      );

      const testElement = queryByText(testString);
      expect(testElement).toBeInTheDocument();
    });
    it('does not render the component if a single permission is not met', () => {
      const { queryByText } = render(
        <Permitted requiredPermissions={[invalidPermissionString]}>
          {testString}
        </Permitted>
      );

      const testElement = queryByText(testString);
      expect(testElement).not.toBeInTheDocument();
    });
    it('does not render the component if multiple permissions are not met', () => {
      const { queryByText } = render(
        <Permitted requiredPermissions={invalidPermissionsArray}>
          {testString}
        </Permitted>
      );

      const testElement = queryByText(testString);
      expect(testElement).not.toBeInTheDocument();
    });
    it('renders the unpermittedComponent if a permission is not met', () => {
      const { queryByText } = render(
        <Permitted
          requiredPermissions={[invalidPermissionString]}
          unpermittedComponent={unPermittedTestString}
        >
          {testString}
        </Permitted>
      );

      const testElement = queryByText(unPermittedTestString);
      expect(testElement).toBeInTheDocument();
    });

    it('renders the PermissionDenied component if a permission is not met', () => {
      const { queryByText } = render(
        <Permitted requiredPermissions={[invalidPermissionString]}>
          {testString}
        </Permitted>
      );

      const testElement = queryByText('Permission Denied');
      expect(testElement).toBeInTheDocument();
    });
  });
});
