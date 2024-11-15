export interface AccessToken {
    sub: string; // Subject (usually user id)
    exp: number; // Expiration time
    nbf?: number; // Not before
    iat: number; // Issued at
    jti: string; // JWT ID
    aud: string; // Audience
    iss: string; // Issuer
    displayName?: string;
    avatar?: string;
    owns?: {
        boards?: Array<string>;
        catalogs?: Array<string>;
        groups?: Array<string>;
    };
    edits?: {
        boards?: Array<string>;
        catalogs?: Array<string>;
        groups?: Array<string>;
    };
    reads?: {
        boards?: Array<string>;
        catalogs?: Array<string>;
        groups?: Array<string>;
    };
}

export interface RefreshToken {
    sub: string; // Subject (usually user id)
    exp: number; // Expiration time
    nbf?: number; // Not before
    iat: number; // Issued at
    jti: string; // JWT ID
    aud: string; // Audience
    iss: string; // Issuer
}

interface BoardCreationReq {
    catalogId: string;
    creatorId: string;
    title?: string;
}

interface BoardCreationRes {
    boardId: string;
}

interface BoardDuplicateReq {
    catalogId: string;
    creatorId: string;
    boardId: string;
    title?: string;
}

interface BoardDeleteReq {
    boardId: string;
}

interface BoardAddEventReq {
    boardId: string;
    eventId: string;
    eventBody: BoardEventBody;
}

interface BoardEventBody {}

interface ErrorRes {
    code: number;
    message: string;
}

interface BoardGetEventsReq {
    boardId: string;
    page?: number;
    limit?: number;
}

interface BoardGetEventsRes {}

interface BoardRenameReq {
    boardId: string;
    newTitle: string;
}

interface BoardUpdateSnapshotReq {}

interface BoardGetSnapshotReq {}

interface BoardSnaphotRes {}

interface BoardAPI {
    create(req: BoardCreationReq): Promise<BoardCreationRes | ErrorRes>;
    delete(req: BoardDeleteReq): Promise<void | ErrorRes>;
    duplicate(req: BoardDuplicateReq): Promise<BoardCreationRes | ErrorRes>;
    addEvent(req: BoardAddEventReq): Promise<void | ErrorRes>;
    getEvents(req: BoardGetEventsReq): Promise<BoardGetEventsRes | ErrorRes>;
    rename(req: BoardRenameReq): Promise<void | ErrorRes>;
    updateSnapshot(req: BoardUpdateSnapshotReq): Promise<void | ErrorRes>;
    getSnapshot(req: BoardGetSnapshotReq): Promise<BoardSnaphotRes | ErrorRes>;
}

interface LinkCreationReq {
    boardId: string;
    type: "read" | "edit";
}

interface LinkCreationRes {
    boardId: string;
    linkId: string;
    linkUrl: string;
    type: "read" | "edit";
}

interface LinkRemoveReq {
    boardId: string;
}

interface LinkAPI {
    create(req: LinkCreationReq): Promise<LinkCreationRes | ErrorRes>;
    remove(req: LinkRemoveReq): Promise<void | ErrorRes>;
}

interface AccessGrantReq {
    boardId: string;
    userId: string;
    accessType: "read" | "edit";
}

interface AccessRevokeReq {
    boardId: string;
    userId: string;
}

interface AccessAddOwnerReq {
    boardId: string;
    userId: string;
}

interface AccessRemoveOwnerReq {
    boardId: string;
    userId: string;
}

interface AccessAPI {
    grant(req: AccessGrantReq): Promise<void | ErrorRes>;
    revoke(req: AccessRevokeReq): Promise<void | ErrorRes>;
    addOwner(req: AccessAddOwnerReq): Promise<void | ErrorRes>;
    removeOwner(req: AccessRemoveOwnerReq): Promise<void | ErrorRes>;
}

interface AuthSignUpReqEmailPassword {
    type: "EmailPassword";
    email: string;
    password: string;
}

interface AuthSignUpReqUsernamePassword {
    type: "UsernamePassword";
    username: string;
    password: string;
}

interface AuthSignUpReqPhonePassword {
    type: "PhonePassword";
    phone: string;
    password: string;
}

interface AuthSignUpReqEmailPasscode {
    type: "EmailPasscode";
    email: string;
}

interface AuthSignUpReqPhonePasscode {
    type: "PhonePasscode";
    phone: string;
}

type AuthSignUpUserReq =
    | AuthSignUpReqEmailPassword
    | AuthSignUpReqUsernamePassword
    | AuthSignUpReqPhonePassword
    | AuthSignUpReqEmailPasscode
    | AuthSignUpReqPhonePasscode;

interface AuthResendPasscodeReqPhone {
    type: "Phone";
    phone: string;
}

interface AuthResendPasscodeReqEmail {
    type: "Email";
    email: string;
}

type AuthResendPasscodeReq = AuthResendPasscodeReqPhone | AuthResendPasscodeReqEmail;

interface AuthLoginReqEmailPassword {
    type: "EmailPassword";
    email: string;
    password: string;
}

interface AuthLoginReqUsernamePassword {
    type: "UsernamePassword";
    username: string;
    password: string;
}

interface AuthLoginReqPhonePassword {
    type: "PhonePassword";
    phone: string;
    password: string;
}

interface AuthLoginReqEmailPasscode {
    type: "EmailPasscode";
    email: string;
    passcode: string;
}

interface AuthLoginReqPhonePasscode {
    type: "PhonePasscode";
    phone: string;
    passcode: string;
}

type AuthLoginReq =
    | AuthLoginReqEmailPassword
    | AuthLoginReqUsernamePassword
    | AuthLoginReqPhonePassword
    | AuthLoginReqEmailPasscode
    | AuthLoginReqPhonePasscode;

interface AuthRefreshTokenReq {
    refreshToken: RefreshToken;
}

interface AuthLoginRes {
    accessToken: AccessToken;
    refreshToken: RefreshToken;
}

interface AuthAPI {
    registerUser(req: AuthSignUpUserReq): Promise<AuthLoginRes | ErrorRes>;
    resendPasscode(req: AuthResendPasscodeReq): Promise<void | ErrorRes>;
    login(req: AuthLoginReq): Promise<AuthLoginRes | ErrorRes>;
    getCurrentUser(): Promise<UserDetails | ErrorRes>;
    refreshToken(req: AuthRefreshTokenReq): Promise<AuthLoginRes | ErrorRes>;
}

interface UserCreateReq {
    userId: string;
    userDisplayName?: string;
    userAvatar?: string;
}

interface UserDetails {
    userId: string;
    userHomeCatalogId: string;
    userDisplayName?: string;
    userAvatar?: string;
}

interface UserDeleteReq {
    userId: string;
}

interface UserUpdateDetailsReq {
    userId: string;
    userDisplayName?: string;
    userAvatar?: string;
}

interface UserAPI {
    create(req: UserCreateReq): Promise<void | ErrorRes>;
    getDetails(req: UserDetails): Promise<UserDetails | ErrorRes>;
    delete(req: UserDeleteReq): Promise<void | ErrorRes>;
    updateDetails(req: UserUpdateDetailsReq): Promise<void | ErrorRes>;
}

interface GroupCreateReq {
    description?: string;
}

interface GroupCreationRes {
    groupId: string;
}

interface GroupDeleteReq {
    groupId: string;
}

interface GroupUpdateDescriptionReq {
    groupId: string;
    description: string;
}

interface GroupAddUserReq {
    groupId: string;
    userId: string;
}

interface GroupRemoveUserReq {
    groupId: string;
    userId: string;
}

interface GroupAPI {
    create(req: GroupCreateReq): Promise<GroupCreationRes | ErrorRes>;
    delete(req: GroupDeleteReq): Promise<void | ErrorRes>;
    updateDescription(req: GroupUpdateDescriptionReq): Promise<void | ErrorRes>;
    addUser(req: GroupAddUserReq): Promise<void | ErrorRes>;
    removeUser(req: GroupRemoveUserReq): Promise<void | ErrorRes>;
}

interface CatalogCreateReq {
    parentCatalogId: string;
    catalogName: string;
}

interface CatalogCreationRes {
    catalogId: string;
}

interface CatalogDeleteReq {
    catalogId: string;
}

interface CatalogRenameReq {
    catalogId: string;
    newName: string;
}

interface CatalogListElementsReq {
    catalogId: string;
}

interface CatalogAddElementReq {
    catalogId: string;
    elementId: string;
    elementName: string;
}

interface CatalogDeleteElementReq {
    catalogId: string;
    elementId: string;
}

type CatalogElementsListRes = any; // TODO: make this a proper type

interface CatalogAPI {
    create(req: CatalogCreateReq): Promise<CatalogCreationRes | ErrorRes>;
    delete(req: CatalogDeleteReq): Promise<void | ErrorRes>;
    rename(req: CatalogRenameReq): Promise<void | ErrorRes>;
    listElements(req: CatalogListElementsReq): Promise<CatalogElementsListRes | ErrorRes>;
    addElement(req: CatalogAddElementReq): Promise<void | ErrorRes>;
    deleteElement(req: CatalogDeleteElementReq): Promise<void | ErrorRes>;
}

export interface WebApi {
    board: BoardAPI;
    link: LinkAPI;
    access: AccessAPI;
    auth: AuthAPI;
    user: UserAPI;
    group: GroupAPI;
    catalog: CatalogAPI;
}
