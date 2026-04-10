const BACKEND = process.env.BACKEND_URL;

type FetchOptions = RequestInit & { cookieHeader?: string };

export async function backendFetch(path: string, options: FetchOptions = {}) {
  const { cookieHeader, ...rest } = options;

  return await fetch(`${BACKEND}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(rest.headers as Record<string, string>),
    },
  });
}
