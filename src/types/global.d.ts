export {};

declare global {
  type publicArticleObject = {
    id: string;
    owner: number;
    title: string;
    previewImage: string?
  };

  type baseArticleObject = {
    owner: number;
    title: string;
    body: string;
    type: string;
  };

  interface articleObject extends baseArticleObject {
    id: string;
    createdAt: Number;
    views: number;
    tags: Array<string>;
  }

  interface ArticleEditPermissions {
    [key: string]: number;
  }

  type profile = {
    token: string;
    id: string;
    createdAt: number;
    sitePermissionLevel: number;
    favoriteRoutes?: Array<string>
    settings: Object<any>;
  }

  type profileEditRequest = {
    favoriteRoutes: Array<string>
    settings: Object<any>;
  }

  type user = {
    id: string; 
    socketId: string; 
    role: string;
    joined: Number;
  }

  type roomData = {
    // TrP Assigned types
    Id: number;
    Depot: string;
    VehicleName: string;
    OwnerId: number;
    // Internally assigned types
    route: string;
    dead: boolean;
    assigned: boolean;
    // Optional tow types
    towing?: number;
  }

  type room = {
    masterId: string;
    createdAt: Number;
    data: Object<roomData>;
    connectedIds: Array<user>;
  }

  interface data {
    [key: string]: room;
  }

  namespace NodeJS {
      interface ProcessEnv {
          PORT: number;
          DB_URI: string;
          DB_ID: string;
          OAUTH_REDIRECT: string;
          OAUTH_CID: string;
          OAUTH_SECRET: string;
      }
  }
}
