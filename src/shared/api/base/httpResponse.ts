export class HTTPResponse<R> extends Response {
  data: R | null = null;

  constructor(response: Response) {
    super(response.status !== 204 ? response.body : null, response);
  }
}
