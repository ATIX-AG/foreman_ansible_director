declare module 'foremanReact/common/I18n' {
  export const translate: (string: string) => string;

  interface Substitutions {
    [key: string]: string | number;
  }
  export const sprintf: (
    string: string,
    substitutions: Substitutions
  ) => string;
}
