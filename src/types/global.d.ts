export {};

declare global {
  type publicArticleObject = {
    id: string;
    owner: number;
    title: string;
  };

  type baseArticleObject = {
    owner: number;
    title: string;
    body: string;
    type: string;
  };

  interface articleObject extends baseArticleObject {
    id: string;
    createdAt: Date;
    views: number;
  }

  interface ArticleEditPermissions {
    [key: string]: number;
  }

  namespace NodeJS {
      interface ProcessEnv {
          PORT: number;
          DB_URI: string;
          DB_ID: string;
          OAUTH_REDIRECT: string;
          OAUTH_CID: number;
          OAUTH_SECRET: string;
      }
  }
}
