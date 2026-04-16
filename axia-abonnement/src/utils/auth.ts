export function getToken(): string | null {
  return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
}

export function clearTokens(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("rememberMe");

  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("user");
}