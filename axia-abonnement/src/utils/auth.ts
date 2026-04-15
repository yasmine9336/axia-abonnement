// src/utils/auth.ts

export function getToken(): string | null {
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
}

export function clearTokens(): void {
  localStorage.clear();
  sessionStorage.clear();
}
