import { Query } from 'mongoose';

export interface PaginatedResult<T> {
  result: T[];
  next: string | null;
  prev: string | null;
}
export const defaultLimitPerPage = 20;

export async function paginate<T>(
  query: Query<T[], any>,
  path: URL,
  params: Record<string, string | undefined>
): Promise<PaginatedResult<T>> {
  const page = params?.page ? parseInt(params.page.toString()) : 1;
  const limit = params?.limit
    ? parseInt(params.limit.toString())
    : defaultLimitPerPage;
  const skip = (page - 1) * limit;

  try {
    const result = await query
      .sort({ _id: 1 })
      .limit(limit === 0 ? limit : limit + 1)
      .skip(skip);

    const isNext = limit !== 0 && result.length === limit + 1;

    if (isNext) {
      result.pop();
    }

    const nextUrl = new URL(path.toString());
    nextUrl.searchParams.append('page', (page + 1).toString());

    if (limit !== defaultLimitPerPage) {
      nextUrl.searchParams.append('limit', limit.toString());
    }

    return {
      result,
      next: isNext ? nextUrl.toString() : null,
      prev: null,
    };
  } catch (error) {
    return Promise.reject(error);
  }
}

export function paginateList<T>(
  list: T[],
  page: number,
  limit = defaultLimitPerPage
): PaginatedResult<T> {
  const skip = (page - 1) * limit;

  const result = list.slice(skip, limit !== 0 ? skip + limit : undefined);
  const isNext = limit !== 0 && !!list[skip + limit];

  return {
    result,
    next: isNext ? '' : null,
    prev: null,
  };
}
