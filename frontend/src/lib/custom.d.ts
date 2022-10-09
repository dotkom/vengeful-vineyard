declare module "*.svg" {
  const content: any;
  export default content;
}

declare module "@dopry/svelte-oidc" {
  const content: any;
  export const OidcContext: any;
  export const isAuthenticated: any;
  export const accessToken: any;
  export const LoginButton: any;
  export const LogoutButton: any;
  export const userInfo: any;
  export default content;
}
