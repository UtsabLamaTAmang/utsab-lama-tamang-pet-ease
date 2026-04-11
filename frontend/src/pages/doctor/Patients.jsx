import React, { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

import { 
    Search, 
    User, 
    Calendar,
    FileText,
    Pill,
    Plus,
    X,
    Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';

const baseURL = "http://localhost:5000";

export default function DoctorPatients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Prescription Modal State
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [prescriptionForm, setPrescriptionForm] = useState({
        diagnosis: '',
        instructions: '',
        followUpDate: ''
    });
    
    // Medications dynamic list
    const [medications, setMedications] = useState([]);
    const [currentMed, setCurrentMed] = useState({ name: '', dosage: '', frequency: '', duration: '' });

    const fetchPatients = async (search = '') => {
        try {
            setLoading(true);
            const { data } = await apiClient.get(`/doctors/patients?search=${search}`);
            if (data.success) {
                setPatients(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch patients', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPatients(searchTerm);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const openPrescriptionModal = (patient) => {
        setSelectedPatient(patient);
        setPrescriptionForm({
            diagnosis: '',
            instructions: '',
            followUpDate: ''
        });
        setMedications([]);
        setIsPrescriptionModalOpen(true);
    };

    const addMedication = () => {
        if (!currentMed.name) return;
        setMedications([...medications, currentMed]);
        setCurrentMed({ name: '', dosage: '', frequency: '', duration: '' });
    };

    const removeMedication = (index) => {
        setMedications(medications.filter((_, i) => i !== index));
    };

    const handlePrescriptionSubmit = async () => {
        if (!selectedPatient?.latestConsultationId) {
            toast.error('Cannot prescribe without a valid previous consultation.');
            return;
        }
        
        if (medications.length === 0) {
            toast.error('Please add at least one medication.');
            return;
        }

        try {
            const payload = {
                consultationId: selectedPatient.latestConsultationId,
                petId: selectedPatient.id,
                diagnosis: prescriptionForm.diagnosis,
                instructions: prescriptionForm.instructions,
                followUpDate: prescriptionForm.followUpDate || null,
                medications: medications // sending as array of objects
            };

            const { data } = await apiClient.post('/doctors/prescriptions', payload);
            
            if (data.success) {
                toast.success('Prescription created successfully!');
                setIsPrescriptionModalOpen(false);
                fetchPatients(searchTerm); // Refresh to show latest prescription
            }
        } catch (error) {
            console.error('Failed to create prescription', error);
            toast.error(error.response?.data?.message || 'Failed to create prescription');
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Patient Directory</h1>
                    <p className="text-neutral-500 mt-2">Manage your pet patients, view history, and issue prescriptions.</p>
                </div>
                
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-neutral-400" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Search by pet name or owner..."
                        className="pl-10 py-6 bg-white border-neutral-200 shadow-sm rounded-xl focus-visible:ring-primary-500 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Patients Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : patients.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center shadow-sm">
                    <User className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-neutral-900">No Patients Found</h3>
                    <p className="text-neutral-500 mt-2">
                        {searchTerm ? "No patients match your search criteria." : "You haven't had any consultations yet."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {patients.map((patient) => (
                        <div key={patient.id} className="bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 flex flex-col h-full">
                            
                            {/* Pet Info */}
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-primary-50 flex-shrink-0 border border-primary-100 flex items-center justify-center">
                                    {patient.imageUrl ? (
                                        <img src={`${baseURL}${patient.imageUrl}`} alt={patient.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-primary-600">{patient.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-neutral-900 truncate">{patient.name}</h3>
                                            <p className="text-sm font-medium text-primary-600">{patient.species} • {patient.breed || 'Unknown'}</p>
                                        </div>
                                        <Badge variant="outline" className="bg-neutral-50">
                                            Age: {patient.age ? `${patient.age} yrs` : 'Unknown'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-4 text-sm bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                <div>
                                    <span className="text-neutral-400 block text-xs uppercase tracking-wider font-bold mb-1">Owner</span>
                                    <span className="font-medium text-neutral-900 flex items-center gap-1">
                                        <User className="w-3.5 h-3.5 text-neutral-400" />
                                        {patient.owner?.fullName}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-neutral-400 block text-xs uppercase tracking-wider font-bold mb-1">Contact</span>
                                    <span className="font-medium text-neutral-900 truncate block">
                                        {patient.owner?.phone || patient.owner?.email}
                                    </span>
                                </div>
                            </div>

                            {/* Recent Prescription Snippet */}
                            <div className="mt-6 flex-1 flex flex-col justify-end">
                                {patient.prescriptions && patient.prescriptions.length > 0 ? (
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Activity className="w-4 h-4 text-green-500" />
                                            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Latest Diagnosis</span>
                                        </div>
                                        <p className="text-sm text-neutral-700 bg-green-50/50 p-3 rounded-lg border border-green-100">
                                            "{patient.prescriptions[0].diagnosis || 'No specific diagnosis'}"
                                        </p>
                                    </div>
                                ) : (
                                    <div className="mb-4">
                                        <p className="text-sm text-neutral-400 italic">No previous prescriptions found from you.</p>
                                    </div>
                                )}
                                
                                <Button 
                                    className="w-full gap-2 bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
                                    onClick={() => openPrescriptionModal(patient)}
                                    disabled={!patient.latestConsultationId}
                                >
                                    <Pill className="w-4 h-4" />
                                    {patient.latestConsultationId ? 'Give Prescription' : 'No Valid Consultation'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Prescription Modal */}
            <Dialog open={isPrescriptionModalOpen} onOpenChange={setIsPrescriptionModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <FileText className="w-6 h-6 text-primary-600" />
                            Issue Prescription
                        </DialogTitle>
                        <DialogDescription>
                            Creating a prescription for <strong className="text-neutral-900">{selectedPatient?.name}</strong> (Owner: {selectedPatient?.owner?.fullName})
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        {/* Diagnosis */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-neutral-700">Diagnosis</label>
                            <Input 
                                placeholder="e.g. Mild skin infection" 
                                value={prescriptionForm.diagnosis}
                                onChange={(e) => setPrescriptionForm({...prescriptionForm, diagnosis: e.target.value})}
                            />
                        </div>

                        {/* Medications Builder */}
                        <div className="space-y-3 bg-neutral-50 p-5 rounded-xl border border-neutral-200">
                            <label className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                                <Pill className="w-4 h-4 text-primary-500" />
                                Medications
                            </label>
                            
                            {medications.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {medications.map((med, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                                            <div className="flex-1">
                                                <p className="font-semibold text-neutral-900 text-sm">{med.name} <span className="text-neutral-500 font-normal">({med.dosage})</span></p>
                                                <p className="text-xs text-neutral-500 mt-0.5">{med.frequency} • {med.duration}</p>
                                            </div>
                                            <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeMedication(idx)}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 pb-2">
                                <Input 
                                    placeholder="Medicine Name (e.g. Amoxicillin)" 
                                    value={currentMed.name}
                                    onChange={(e) => setCurrentMed({...currentMed, name: e.target.value})}
                                />
                                <Input 
                                    placeholder="Dosage (e.g. 250mg)" 
                                    value={currentMed.dosage}
                                    onChange={(e) => setCurrentMed({...currentMed, dosage: e.target.value})}
                                />
                                <Input 
                                    placeholder="Frequency (e.g. 2x a day)" 
                                    value={currentMed.frequency}
                                    onChange={(e) => setCurrentMed({...currentMed, frequency: e.target.value})}
                                />
                                <Input 
                                    placeholder="Duration (e.g. 7 days)" 
                                    value={currentMed.duration}
                                    onChange={(e) => setCurrentMed({...currentMed, duration: e.target.value})}
                                />
                            </div>
                            <Button type="button" variant="outline" className="w-full gap-2 border-primary-200 text-primary-700 hover:bg-primary-50" onClick={addMedication}>
                                <Plus className="w-4 h-4" /> Add Medication
                            </Button>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-neutral-700">Special Instructions</label>
                            <Textarea 
                                placeholder="Any additional care instructions or notes for the owner..." 
                                className="min-h-[100px]"
                                value={prescriptionForm.instructions}
                                onChange={(e) => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
                            />
                        </div>

                        {/* Follow Up Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-neutral-700">Follow-up Date (Optional)</label>
                            <Input 
                                type="date" 
                                className="w-auto"
                                value={prescriptionForm.followUpDate}
                                onChange={(e) => setPrescriptionForm({...prescriptionForm, followUpDate: e.target.value})}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-6 border-t pt-4">
                        <Button variant="outline" onClick={() => setIsPrescriptionModalOpen(false)}>Cancel</Button>
                        <Button className="bg-primary-600 hover:bg-primary-700 text-white" onClick={handlePrescriptionSubmit}>
                            Issue Prescription
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
