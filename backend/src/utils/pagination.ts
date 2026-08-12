export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const parsePagination = (
  page?: string | number,
  limit?: string | number
): PaginationParams => {
  const p = Math.max(1, parseInt(String(page || '1'), 10));
  const l = Math.min(100, Math.max(1, parseInt(String(limit || '10'), 10)));
  return {
    page: p,
    limit: l,
    skip: (p - 1) * l,
  };
};

export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(total / params.limit);
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  };
};
