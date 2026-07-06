export type RequestUser = {
  id: string;
  email?: string;
  role?: string;
};

export type RequestLike = {
  user?: RequestUser;
};

export function getRequestUser(request: RequestLike): RequestUser | undefined {
  return request.user;
}
