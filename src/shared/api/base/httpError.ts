type HTTPErrorData = Record<string, unknown> | null;

export class HTTPError extends Error {
  readonly data: HTTPErrorData;
  readonly code: string | undefined;

  constructor(
    public status: number,
    public message: string,
    public response: Response,
    public url: string,
    data: HTTPErrorData = null,
  ) {
    super(message);
    this.name = "HTTPError";
    this.data = data;
    this.code = typeof data?.code === "string" ? data.code : undefined;
  }
}
