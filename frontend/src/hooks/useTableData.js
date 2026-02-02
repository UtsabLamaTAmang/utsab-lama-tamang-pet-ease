import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Universal hook for managing table data with server-side pagination, search, and filters
 * @param {string} queryKey - Base query key for TanStack Query
 * @param {function} fetchFn - Async function that fetches data, receives params object
 * @param {object} options - Additional options
 * @returns {object} - Table state and handlers
 */
export const useTableData = (queryKey, fetchFn, options = {}) => {
    const {
        initialPage = 1,
        initialLimit = 10,
        initialSearch = '',
        initialFilters = {},
        enableUrlParams = true,
        debounceMs = 500
    } = options;

    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize state from URL params if enabled, otherwise use initial values
    const [page, setPage] = useState(() =>
        enableUrlParams ? parseInt(searchParams.get('page') || initialPage) : initialPage
    );
    const [limit, setLimit] = useState(() =>
        enableUrlParams ? parseInt(searchParams.get('limit') || initialLimit) : initialLimit
    );
    const [search, setSearch] = useState(() =>
        enableUrlParams ? (searchParams.get('search') || initialSearch) : initialSearch
    );
    const [filters, setFilters] = useState(() => {
        if (!enableUrlParams) return initialFilters;

        const urlFilters = {};
        searchParams.forEach((value, key) => {
            if (!['page', 'limit', 'search'].includes(key)) {
                urlFilters[key] = value;
            }
        });
        return Object.keys(urlFilters).length > 0 ? urlFilters : initialFilters;
    });

    // Debounced search value
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [search, debounceMs]);

    // Update URL params when state changes
    useEffect(() => {
        if (!enableUrlParams) return;

        const params = new URLSearchParams();
        if (page !== 1) params.set('page', page.toString());
        if (limit !== 10) params.set('limit', limit.toString());
        if (debouncedSearch) params.set('search', debouncedSearch);

        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });

        setSearchParams(params, { replace: true });
    }, [page, limit, debouncedSearch, filters, enableUrlParams, setSearchParams]);

    // Build query params for API call
    const queryParams = {
        page,
        limit,
        search: debouncedSearch,
        ...filters
    };

    // Fetch data with TanStack Query
    const query = useQuery({
        queryKey: [queryKey, queryParams],
        queryFn: ({ signal }) => fetchFn({ ...queryParams, signal }),
        keepPreviousData: true,
        staleTime: 30000 // 30 seconds
    });

    // Handlers
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        setPage(1); // Reset to first page when changing limit
    };

    const handleSearchChange = (newSearch) => {
        setSearch(newSearch);
        setPage(1); // Reset to first page when searching
    };

    const handleFilterChange = (filterKey, filterValue) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: filterValue
        }));
        setPage(1); // Reset to first page when filtering
    };

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        setPage(1);
    };

    const clearFilters = () => {
        setFilters(initialFilters);
        setSearch(initialSearch);
        setPage(1);
    };

    return {
        // Data
        data: query.data?.data || [],
        pagination: query.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },

        // State
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        isFetching: query.isFetching,

        // Current values
        page,
        limit,
        search,
        filters,

        // Handlers
        setPage: handlePageChange,
        setLimit: handleLimitChange,
        setSearch: handleSearchChange,
        setFilter: handleFilterChange,
        setFilters: handleFiltersChange,
        clearFilters,

        // Refetch
        refetch: query.refetch
    };
};
