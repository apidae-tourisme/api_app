export class ApiAppConfig {
  public static readonly API_URL = '';
  public static readonly OAUTH_REDIRECT_URL = '';
  public static readonly OAUTH_AUTH_URL = '';
  public static readonly OAUTH_TOKEN_URL = '';
  public static readonly OAUTH_PROFILE_URL = '';
  public static readonly OAUTH_CLIENT_ID = '';
  public static readonly OAUTH_SECRET = '';

  public static authUrl(redirectUrl): string {
    return ApiAppConfig.OAUTH_AUTH_URL + '?client_id=' + ApiAppConfig.OAUTH_CLIENT_ID + '&redirect_uri=' +
      redirectUrl + '&scope=sso&response_type=code';
  }
}
