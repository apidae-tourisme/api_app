export class ApiAppConfig {
  public static readonly API_URL = '';

  // OAuth & SSO config
  // Web only
  // public static readonly OAUTH_REDIRECT_URL = 'http://localhost:8888/login';
  public static readonly OAUTH_REDIRECT_URL = 'http://apiapp.apidae.net/redirection.html';
  public static readonly OAUTH_AUTH_URL = 'https://base.apidae-tourisme.com/oauth/authorize';
  public static readonly OAUTH_TOKEN_URL = 'https://proxy.apidae.net/api.apidae-tourisme.com/oauth/token';
  public static readonly OAUTH_PROFILE_URL = 'https://proxy.apidae.net/api.apidae-tourisme.com/api/v002/sso/utilisateur/profil';
  public static readonly OAUTH_CLIENT_ID = '6e0ebc1c-04a7-40c9-818a-90b690935720';
  public static readonly OAUTH_SECRET = 'Ippv1kTtMbLgWxt';

  // Local and remote databases config
  public static readonly LOCAL_DB = 'api-app_local';
  public static readonly REMOTE_DB = 'api-app_preprod3';
  public static readonly DB_URL = 'https://dev-db.apiapp.apidae.net';

  // Sharing
  public static readonly SHARING_HOST = 'https://preprod.apiapp.apidae.net';

  public static authUrl(redirectUrl): string {
    return ApiAppConfig.OAUTH_AUTH_URL + '?client_id=' + ApiAppConfig.OAUTH_CLIENT_ID + '&redirect_uri=' +
      redirectUrl + '&scope=sso&response_type=code';
  }
}
