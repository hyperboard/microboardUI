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