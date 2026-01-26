import { useState } from 'react';
import axios from 'axios';
import { useTableData } from '@/hooks/useTableData';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Star, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DoctorDetailsModal from '@/components/admin/DoctorDetailsModal';

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Fetch function for doctors
const fetchDoctors = async (params) => {
    const { signal, ...queryParams } = params;
    const response = await api.get("/doctors", {
        params: queryParams,
        signal
    });
    // Backend returns { success: true, data: [], pagination: {} }
    // Extract and return in expected format
    return {
        data: response.data.data || [],
        pagination: response.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
    };
};

// Column definitions
const DOCTOR_COLUMNS = [
    {
        header: 'Doctor',
        accessor: 'user',
        headerClassName: 'pl-6',
        cellClassName: 'pl-6',
        cell: (doctor) => (
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage
                        src={doctor.photoUrl ? `http://localhost:5000${doctor.photoUrl}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.user.fullName}`}
                        alt={doctor.user.fullName}
                    />
                    <AvatarFallback className="bg-primary-100 text-primary-700">
                        {doctor.user.fullName.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-medium text-neutral-900">{doctor.user.fullName}</p>
                    <p className="text-sm text-neutral-500">{doctor.user.email}</p>
                </div>
            </div>
        )
    },
    {
        header: 'Specialization',
        accessor: 'specialization',
        headerClassName: 'pl-6',
        cellClassName: 'pl-6',
        cell: (doctor) => (
            <Badge variant="secondary" className="font-normal">
                {doctor.specialization}
            </Badge>
        )
    },
    {
        header: 'Experience',
        accessor: 'experienceYears',
        headerClassName: 'pl-6',
        cellClassName: 'pl-6',
        cell: (doctor) => (
            <span className="text-neutral-700">{doctor.experienceYears} years</span>
        )
    },
    {
        header: 'Fee',
        accessor: 'fee',
        headerClassName: 'text-right pl-6',
        cellClassName: 'text-right pl-6',
        cell: (doctor) => (
            <span className="font-semibold text-neutral-900">${doctor.fee}</span>
        )
    },
    {
        header: 'Rating',
        accessor: 'averageRating',
        headerClassName: 'pl-6',
        cellClassName: 'pl-6',
        cell: (doctor) => (
            <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{doctor.averageRating || '0.0'}</span>
                <span className="text-sm text-neutral-500">({doctor.totalConsultations || 0})</span>
            </div>
        )
    },
    {
        header: 'Status',
        accessor: 'verificationStatus',
        headerClassName: 'pl-6',
        cellClassName: 'pl-6',
        cell: (doctor) => {
            const statusConfig = {
                APPROVED: { variant: 'default', label: 'Approved', className: 'bg-green-100 text-green-700 hover:bg-green-200' },
                PENDING: { variant: 'secondary', label: 'Pending', className: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
                REJECTED: { variant: 'destructive', label: 'Rejected', className: '' },
                DISABLED: { variant: 'outline', label: 'Disabled', className: 'bg-neutral-100 text-neutral-600' }
            };
            const config = statusConfig[doctor.verificationStatus] || statusConfig.PENDING;
            return (
                <Badge variant={config.variant} className={config.className}>
                    {config.label}
                </Badge>
            );
        }
    },
    {
        id: 'actions',
        cell: (doctor) => (
            <div className="text-right pr-6">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                </Button>
            </div>
        )
    }
];

export default function Doctors() {
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [specializationFilter, setSpecializationFilter] = useState('');

    // Use the table data hook
    const {
        data: doctors,
        pagination,
        isLoading,
        isFetching,
        search,
        setSearch,
        setPage,
        setLimit,
        setFilter,
        clearFilters,
        refetch
    } = useTableData('doctors', fetchDoctors, {
        initialLimit: 10,
        enableUrlParams: true
    });

    const handleRowClick = (doctor) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    const handleDoctorUpdated = () => {
        refetch();
    };

    const handleStatusFilterChange = (value) => {
        const filterValue = value === 'all' ? '' : value;
        setStatusFilter(filterValue);
        setFilter('status', filterValue);
    };

    const handleSpecializationFilterChange = (value) => {
        const filterValue = value === 'all' ? '' : value;
        setSpecializationFilter(filterValue);
        setFilter('specialization', filterValue);
    };

    const hasActiveFilters = search || statusFilter || specializationFilter;

    // Column definitions
    const columns = [
        {
            header: 'Doctor',
            accessor: 'user',
            headerClassName: 'pl-6',
            cellClassName: 'pl-6',
            cell: (doctor) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage
                            src={doctor.photoUrl ? `http://localhost:5000${doctor.photoUrl}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.user.fullName}`}
                            alt={doctor.user.fullName}
                        />
                        <AvatarFallback className="bg-primary-100 text-primary-700">
                            {doctor.user.fullName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium text-neutral-900">{doctor.user.fullName}</p>
                        <p className="text-sm text-neutral-500">{doctor.user.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Specialization',
            accessor: 'specialization',
            headerClassName: 'pl-6',
            cellClassName: 'pl-6',
            cell: (doctor) => (
                <Badge variant="secondary" className="font-normal">
                    {doctor.specialization}
                </Badge>
            )
        },
        {
            header: 'Experience',
            accessor: 'experienceYears',
            headerClassName: 'pl-6',
            cellClassName: 'pl-6',
            cell: (doctor) => (
                <span className="text-neutral-700">{doctor.experienceYears} years</span>
            )
        },
        {
            header: 'Fee',
            accessor: 'fee',
            headerClassName: 'text-right pl-6',
            cellClassName: 'text-right pl-6',
            cell: (doctor) => (
                <span className="font-semibold text-neutral-900">${doctor.fee}</span>
            )
        },
        {
            header: 'Rating',
            accessor: 'averageRating',
            headerClassName: 'pl-6',
            cellClassName: 'pl-6',
            cell: (doctor) => (
                <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{doctor.averageRating || '0.0'}</span>
                    <span className="text-sm text-neutral-500">({doctor.totalConsultations || 0})</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'verificationStatus',
            headerClassName: 'pl-6',
            cellClassName: 'pl-6',
            cell: (doctor) => {
                const statusConfig = {
                    APPROVED: { variant: 'default', label: 'Approved', className: 'bg-green-100 text-green-700 hover:bg-green-200' },
                    PENDING: { variant: 'secondary', label: 'Pending', className: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
                    REJECTED: { variant: 'destructive', label: 'Rejected', className: '' },
                    DISABLED: { variant: 'outline', label: 'Disabled', className: 'bg-neutral-100 text-neutral-600' }
                };
                const config = statusConfig[doctor.verificationStatus] || statusConfig.PENDING;
                return (
                    <Badge variant={config.variant} className={config.className}>
                        {config.label}
                    </Badge>
                );
            }
        },
        {
            id: 'actions',
            cell: (doctor) => (
                <div className="text-right pr-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(doctor);
                        }}
                    >
                        <Eye className="h-4 w-4 text-neutral-500" />
                        <span className="sr-only">View</span>
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-neutral-900">Doctors</h1>
                <p className="text-neutral-500 mt-1">Manage doctor verifications and profiles</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                        placeholder="Search doctors by name, email, or specialization..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter || undefined} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="DISABLED">Disabled</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={specializationFilter || undefined} onValueChange={handleSpecializationFilterChange}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by specialization" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Specializations</SelectItem>
                        <SelectItem value="Surgery">Surgery</SelectItem>
                        <SelectItem value="Dentistry">Dentistry</SelectItem>
                        <SelectItem value="Dermatology">Dermatology</SelectItem>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="General">General Practice</SelectItem>
                    </SelectContent>
                </Select>
                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearch('');
                            setStatusFilter('');
                            setSpecializationFilter('');
                            clearFilters();
                        }}
                        className="gap-2"
                    >
                        <X className="h-4 w-4" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={doctors}
                pagination={pagination}
                onPageChange={setPage}
                onLimitChange={setLimit}
                onRowClick={handleRowClick}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="No doctors found"
            />

            {/* Doctor Details Modal */}
            {selectedDoctor && (
                <DoctorDetailsModal
                    doctor={selectedDoctor}
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    onDoctorUpdated={handleDoctorUpdated}
                />
            )}
        </div>
    );
}
