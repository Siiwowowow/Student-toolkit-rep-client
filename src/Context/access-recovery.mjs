// A temporary transport/service failure is different from denied account access.
export function isTemporaryAccessFailure(error) {
  return error?.name === 'AbortError' || error instanceof TypeError ||
    [408, 429, 500, 502, 503, 504].includes(error?.status);
}
