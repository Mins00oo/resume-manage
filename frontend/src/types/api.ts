export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
};

export type MeResponse = {
  id: number;
  email: string;
  name: string;
  profileImageUrl: string | null;
};
