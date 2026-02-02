import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * Universal DataTable Component
 * @param {Array} columns - Column definitions [{ header, accessor, cell }]
 * @param {Array} data - Data array
 * @param {Object} pagination - Pagination info { page, limit, total, totalPages }
 * @param {Function} onPageChange - Page change handler
 * @param {Function} onLimitChange - Limit change handler
 * @param {Function} onRowClick - Row click handler (optional)
 * @param {Boolean} isLoading - Loading state
 * @param {Boolean} isFetching - Fetching state (for background updates)
 * @param {String} emptyMessage - Message when no data
 */
export const DataTable = ({
    columns = [],
    data = [],
    pagination = { page: 1, limit: 10, total: 0, totalPages: 0 },
    onPageChange,
    onLimitChange,
    onRowClick,
    isLoading = false,
    isFetching = false,
    emptyMessage = 'No data available'
}) => {
    const { page, limit, total, totalPages } = pagination;

    // Calculate range
    const startIndex = (page - 1) * limit + 1;
    const endIndex = Math.min(page * limit, total);

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (page <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (page >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(page - 1);
                pages.push(page);
                pages.push(page + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (isLoading) {
        return <TableSkeleton columns={columns} rows={limit} />;
    }

    return (
        <div className="space-y-4">
            {/* Table */}
            <div className="border rounded-lg bg-white shadow-sm overflow-hidden relative">
                {isFetching && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary-100 overflow-hidden">
                        <div className="h-full bg-primary-600 animate-pulse w-1/3"></div>
                    </div>
                )}

                <Table>
                    <TableHeader>
                        <TableRow className="bg-neutral-50 hover:bg-neutral-50">
                            {columns.map((column, index) => (
                                <TableHead
                                    key={index}
                                    className={`font-semibold text-neutral-700 ${column.headerClassName || ''}`}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-64">
                                    <EmptyState message={emptyMessage} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, rowIndex) => (
                                <TableRow
                                    key={rowIndex}
                                    onClick={() => onRowClick?.(row)}
                                    className={onRowClick ? 'cursor-pointer hover:bg-neutral-50' : ''}
                                >
                                    {columns.map((column, colIndex) => (
                                        <TableCell key={colIndex} className={column.cellClassName || ''}>
                                            {column.cell
                                                ? column.cell(row, rowIndex)
                                                : row[column.accessor]
                                            }
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                    {/* Results info */}
                    <div className="text-sm text-neutral-600">
                        Showing <span className="font-medium text-neutral-900">{startIndex}</span> to{' '}
                        <span className="font-medium text-neutral-900">{endIndex}</span> of{' '}
                        <span className="font-medium text-neutral-900">{total}</span> results
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Rows per page */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-neutral-600">Rows per page:</span>
                            <Select value={limit.toString()} onValueChange={(val) => onLimitChange?.(parseInt(val))}>
                                <SelectTrigger className="w-[70px] h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Page navigation */}
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onPageChange?.(1)}
                                disabled={page === 1}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onPageChange?.(page - 1)}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {/* Page numbers */}
                            <div className="hidden sm:flex items-center gap-1">
                                {getPageNumbers().map((pageNum, idx) => (
                                    pageNum === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-neutral-400">...</span>
                                    ) : (
                                        <Button
                                            key={pageNum}
                                            variant={page === pageNum ? 'default' : 'outline'}
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => onPageChange?.(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    )
                                ))}
                            </div>

                            {/* Mobile page indicator */}
                            <div className="sm:hidden px-3 text-sm text-neutral-600">
                                Page {page} of {totalPages}
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onPageChange?.(page + 1)}
                                disabled={page === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onPageChange?.(totalPages)}
                                disabled={page === totalPages}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Loading Skeleton Component
const TableSkeleton = ({ columns, rows = 10 }) => (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow className="bg-neutral-50">
                    {columns.map((column, index) => (
                        <TableHead key={index} className="font-semibold">
                            <div className="h-4 bg-neutral-200 rounded animate-pulse w-24"></div>
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                        {columns.map((_, colIndex) => (
                            <TableCell key={colIndex}>
                                <div className="h-4 bg-neutral-100 rounded animate-pulse"></div>
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);

// Empty State Component
const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <svg
                className="w-8 h-8 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
            </svg>
        </div>
        <p className="text-neutral-600 font-medium">{message}</p>
        <p className="text-sm text-neutral-400 mt-1">Try adjusting your search or filters</p>
    </div>
);
