export interface UseCase<Payload, Response> {
  execute(payload: Payload): Promise<Response>
}
