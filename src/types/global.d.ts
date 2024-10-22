export {};

declare global {
  type ownerData = {
    id:string,
    name:string,
    icon:string
  }

  type publicArticleObject = {
    id: string;
    owner: ownerData?;
    title: string;
    previewImage: string?
  };

  type baseArticleObject = {
    owner: string;
    title: string;
    body: string;
    type: string;
    tags: Array<string>;
  };

  interface articleObject extends baseArticleObject {
    id: string;
    createdAt: Number;
    views: number;
  }

  type articleSearch = {
    query? : string,
    owner? : string,
    tags? : Array<string>,
    type : string
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
