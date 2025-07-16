export class Location {
  /** Parse current location pathname for board id. */
  getCurrentBoardId(): string | undefined {
    const pathname = window.location.pathname;
    return this.getBoardId(pathname);
  }

  /** Parse pathname for board id. */
  getBoardId(pathname: string): string | undefined {
    const regex = /^\/boards\/([A-Za-z0-9\-]+)$/;
    const matches = pathname.match(regex);
    if (matches !== null && matches.length > 0) {
      return matches[1];
    } else {
      return undefined;
    }
  }

  /** Get pathname from an url */
  getPathname(id: string): string {
    return "/boards/" + id;
  }
}
