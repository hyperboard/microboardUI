export interface Permissions {
  owns: {
      boards: Array<string>;
      catalogs?: Array<string>;
      groups?: Array<string>;
  };
  edits: {
      boards: Array<string>;
      catalogs?: Array<string>;
      groups?: Array<string>;
  };
  reads: {
      boards: Array<string>;
      catalogs?: Array<string>;
      groups?: Array<string>;
  };
}

export type RegisterPayload = {
    email: string;
    password: string;
    name: string;
    newsletter: boolean;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export type RefreshPayload = {
    refreshToken: string;
};

export type VerifyEmailPayload = {
    passcode: string;
    email: string;
};

export type ResendEmailPayload = {
    email: string;
};
