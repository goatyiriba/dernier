
import React, { useState, useEffect } from 'react';
import { Employee, LeaveRequest, AuthService } from '@/api/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Clock, MessageSquare, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const leaveTypes = ["Vacation", "Sick", "Personal", "Maternity", "Paternity", "Bereavement", "Other"];

function RequestLeaveModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const days = differenceInDays(new Date(formData.end_date), new Date(formData.start_date)) + 1;
      await onSave({ ...formData, days_requested: days });
      onClose();
    } catch(error) {
      console.error("Error submitting leave request", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Time Off</DialogTitle>
          <DialogDescription>Fill out the form below to request leave.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="leave_type">Leave Type</Label>
            <Select onValueChange={(value) => setFormData({...formData, leave_type: value})} required>
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" type="date" onChange={e => setFormData({...formData, start_date: e.target.value})} required/>
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input id="end_date" type="date" onChange={e => setFormData({...formData, end_date: e.target.value})} required/>
            </div>
          </div>
          <div>
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea id="reason" placeholder="Briefly explain your reason for leave" onChange={e => setFormData({...formData, reason: e.target.value})}/>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit Request"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const statusColors = {
  Pending: "bg-amber-100 text-amber-800",
  Approved: "bg-green-100 text-green-800",
  Denied: "bg-red-100 text-red-800",
  Cancelled: "bg-slate-100 text-slate-800"
};

const statusIcons = {
  Pending: <AlertTriangle className="w-4 h-4 text-amber-600" />,
  Approved: <CheckCircle className="w-4 h-4 text-green-600" />,
  Denied: <XCircle className="w-4 h-4 text-red-600" />,
};

export default function MyLeave() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      const user = await AuthService.me();
      if (user) {
        // Try to find employee by employee_id first, then by email
        let employeeData = null;
        if (user.employee_id) {
          const employeeResults = await Employee.filter({ employee_id: user.employee_id });
          if (employeeResults.length > 0) {
            employeeData = employeeResults[0];
          }
        }
        
        if (!employeeData) {
          // Try to find by email
          const employeeResults = await Employee.filter({ email: user.email });
          if (employeeResults.length > 0) {
            employeeData = employeeResults[0];
          }
        }

        if (employeeData) {
          setEmployee(employeeData);
          const requests = await LeaveRequest.filter({ employee_id: employeeData.id }, "-created_date");
          setLeaveRequests(requests);
        }
      }
    } catch (error) {
      console.error("Error loading leave data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestLeave = async (leaveData) => {
    if (!employee) return;
    await LeaveRequest.create({ ...leaveData, employee_id: employee.id, status: 'Pending' });
    loadData();
  };

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">My Leave Requests</h1>
            <p className="text-slate-600">Track and manage your time off requests.</p>
          </div>
          <Button onClick={() => setShowRequestModal(true)} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
            <Plus className="w-5 h-5 mr-2" />
            Request Leave
          </Button>
        </div>

        <div className="grid gap-4">
          <AnimatePresence>
          {isLoading ? (
            <p>Loading requests...</p>
          ) : leaveRequests.length > 0 ? (
            leaveRequests.map(request => (
              <motion.div key={request.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg text-slate-900">{request.leave_type} Leave</h3>
                          <Badge className={statusColors[request.status]}>
                            {statusIcons[request.status]}
                            <span className="ml-2">{request.status}</span>
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/>{format(new Date(request.start_date), 'MMM d, yyyy')} - {format(new Date(request.end_date), 'MMM d, yyyy')}</div>
                          <div className="flex items-center gap-1.5"><Clock className="w-4 h-4"/>{request.days_requested} days</div>
                        </div>
                        {request.reason && <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-md"><span className="font-medium">Reason:</span> {request.reason}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
             <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800">No Leave Requests Found</h3>
                  <p className="text-slate-500 mt-2">Click "Request Leave" to submit your first time off request.</p>
                </CardContent>
              </Card>
          )}
          </AnimatePresence>
        </div>
      </div>
      <RequestLeaveModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSave={handleRequestLeave}
      />
    </div>
  );
}
