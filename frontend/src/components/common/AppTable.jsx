import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * AppTable component for displaying data in a table format.
 * 
 * @param {Object[]} columns - Array of column definitions.
 * @param {string} columns[].header - Header text for the column.
 * @param {string} columns[].accessorKey - Key to access data in the row object. (or use cell)
 * @param {function} columns[].cell - Optional render function for the cell content. (row) => ReactNode
 * @param {string} columns[].className - Optional class name for the cell.
 * @param {Object[]} data - Array of data objects to display.
 * @param {string} className - Optional class name for the table container.
 * @param {string} onRowClick - Optional callback when a row is clicked.
 */
export default function AppTable({ columns, data, className, onRowClick }) {
    return (
        <div className={cn("rounded-md border border-neutral-200 overflow-hidden", className)}>
            <Table>
                <TableHeader className="bg-neutral-50">
                    <TableRow>
                        {columns.map((column, index) => (
                            <TableHead key={index} className={cn("font-semibold text-neutral-700", column.className)}>
                                {column.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data && data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <TableRow
                                key={rowIndex}
                                className={cn("hover:bg-neutral-50/50 transition-colors", onRowClick && "cursor-pointer")}
                                onClick={() => onRowClick && onRowClick(row)}
                            >
                                {columns.map((column, colIndex) => (
                                    <TableCell key={colIndex} className={column.className}>
                                        {column.cell ? column.cell(row) : row[column.accessorKey]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center text-neutral-500">
                                No results found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
