export class ExceptionResponse {
  constructor(public status: 'fail' | 'error', public message: string, public data?: Record<string | number | symbol, unknown>) { }
}