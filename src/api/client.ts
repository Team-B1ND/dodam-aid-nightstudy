import { createApiClient } from '@b1nd/api-client';

const BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL);

export const apiClient = createApiClient(BASE_URL);