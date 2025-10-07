import { http, HttpResponse } from "msw";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api.constants";
import { mockAuthService } from "@/services/mock.service";

export const handlers = [
  // Login
  http.post(
    `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`,
    async ({ request }) => {
      const body = (await request.json()) as any;
      try {
        const res = await mockAuthService.login(body);
        return HttpResponse.json(res, { status: 200 });
      } catch (e: any) {
        return HttpResponse.json(e.response.data, {
          status: e.response.status,
        });
      }
    }
  ),

  // Register
  http.post(
    `${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`,
    async ({ request }) => {
      const body = (await request.json()) as any;
      try {
        const res = await mockAuthService.register(body);
        return HttpResponse.json(res, { status: 201 });
      } catch (e: any) {
        return HttpResponse.json(e.response.data, {
          status: e.response.status,
        });
      }
    }
  ),

  // Logout
  http.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, async () => {
    const res = await mockAuthService.logout();
    return HttpResponse.json(res, { status: 200 });
  }),

  // Refresh
  http.post(
    `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
    async ({ request }) => {
      const { refreshToken } = (await request.json()) as any;
      try {
        const res = await mockAuthService.refresh(refreshToken);
        return HttpResponse.json(res, { status: 200 });
      } catch (e: any) {
        return HttpResponse.json(e.response.data, {
          status: e.response.status,
        });
      }
    }
  ),

  // Profile
  http.get(`${API_BASE_URL}/auth/profile`, async ({ request }) => {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    try {
      const res = await mockAuthService.getProfile(token);
      return HttpResponse.json(res, { status: 200 });
    } catch (e: any) {
      return HttpResponse.json(e.response.data, { status: e.response.status });
    }
  }),
];
