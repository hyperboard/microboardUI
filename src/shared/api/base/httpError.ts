export class HTTPError extends Error {
  constructor(
    public status: number,
    public message: string,
    public response: Response,
    public url: string,
  ) {
    super(message);
  }
}
