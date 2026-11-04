import {
  Box, Text, Flex, Button, Table, Thead, Tbody, Tr, Th, Td,
  Input, Select, InputGroup, InputLeftElement, HStack, VStack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure, FormControl, FormLabel, Textarea,
  FormErrorMessage, useToast, Badge, Tooltip, IconButton,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, Checkbox,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { SearchIcon, AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { useForm, Controller } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import {
  projectService, progressService, contractService, milestoneService,
  deliverableService, financialService, riskService, issueService,
  resourceService, interventionService, recoveryService, forwardLookService, userService,
  insuranceService
} from '../services/services';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '../components/States';
import { PageHeader } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const CONFIGS = {
  contracts: {
    title: 'Contract Register',
    service: contractService,
    fields: [
      { name: 'project_id', label: 'Project', type: 'project_select', required: true },
      { name: 'contract_no', label: 'Contract No', type: 'text', required: true },
      { name: 'contract_title', label: 'Contract Title', type: 'text', required: true },
      { name: 'client', label: 'Client', type: 'text' },
      { name: 'contractor_or_consultant', label: 'Contractor/Consultant', type: 'text' },
      { name: 'original_contract_value', label: 'Original Value ($)', type: 'number', required: true },
      { name: 'variation_value', label: 'Variation Value ($)', type: 'number' },
      { name: 'contract_start_date', label: 'Start Date', type: 'date' },
      { name: 'contract_end_date', label: 'End Date', type: 'date' },
      { name: 'contract_signed_date', label: 'Contract Signed Date', type: 'date' },
      { name: 'contract_status', label: 'Status', type: 'select', options: ['ACTIVE', 'COMPLETED', 'EXPIRED', 'SUSPENDED', 'TERMINATED'] },
    ],
    columns: [
      { key: 'contract_no', label: 'Contract No', bold: true, color: 'blue.300' },
      { key: 'contract_title', label: 'Title' },
      { key: 'contract_signed_date', label: 'Contract Signed Date', format: v => v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—', color: 'purple.300' },
      { key: 'original_contract_value', label: 'Orig Value', format: v => v ? `$${Number(v).toLocaleString()}` : '—' },
      { key: 'variation_value', label: 'Variation', format: v => v ? `$${Number(v).toLocaleString()}` : '$0' },
      { key: 'revised_contract_value', label: 'Revised Value', format: v => v ? `$${Number(v).toLocaleString()}` : '—', color: 'cyan.300' },
      { key: 'contract_status', label: 'Status', isStatus: true },
    ]
  },
  progress: {
    title: 'Schedule & Monthly Progress Register',
    service: progressService,
    fields: [
      { name: 'project_id', label: 'Project', type: 'project_select', required: true },
      { name: 'reporting_month', label: 'Reporting Month', type: 'date', required: true },
      { name: 'planned_progress', label: 'Planned Progress (%)', type: 'number', required: true },
      { name: 'actual_progress', label: 'Actual Progress (%)', type: 'number', required: true },
      { name: 'time_elapsed_percent', label: 'Time Elapsed (%)', type: 'number' },
      { name: 'notes', label: 'Progress Notes', type: 'textarea' },
    ],
    columns: [
      { key: 'reporting_month', label: 'Reporting Month', format: v => v ? format(new Date(v), 'MMM yyyy') : '—', color: 'blue.300' },
      { key: 'planned_progress', label: 'Planned', format: v => `${v}%` },
      { key: 'actual_progress', label: 'Actual', format: v => `${v}%`, color: 'green.300' },
      { key: 'schedule_variance', label: 'Variance', format: v => `${v}%`, color: v => v < 0 ? 'red.400' : 'green.400' },
      { key: 'spi', label: 'SPI', color: v => v < 0.8 ? 'red.400' : v < 0.95 ? 'yellow.400' : 'green.400' },
      { key: 'notes', label: 'Notes' },
    ]
  },
  milestones: {
    title: 'Milestone Register',
    service: milestoneService,
    fields: [
      { name: 'project_id', label: 'Project', type: 'project_select', required: true },
      { name: 'name', label: 'Milestone Name', type: 'text', required: true },
      { name: 'planned_date', label: 'Planned Date', type: 'date', required: true },
      { name: 'actual_date', label: 'Actual Date', type: 'date' },
      { name: 'responsible_person', label: 'Responsible Person', type: 'text' },
      { name: 'is_critical', label: 'Critical Milestone?', type: 'checkbox' },
      { name: 'status', label: 'Status', type: 'select', options: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'AT_RISK', 'CANCELLED'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: [
      { key: 'name', label: 'Milestone Name', bold: true },
      { key: 'planned_date', label: 'Planned Date', format: v => v ? format(new Date(v), 'dd MMM yyyy') : '—' },
      { key: 'actual_date', label: 'Actual Date', format: v => v ? format(new Date(v), 'dd MMM yyyy') : '—' },
      { key: 'responsible_person', label: 'Responsible' },
      { key: 'is_critical', label: 'Critical', format: v => v ? 'YES' : 'NO', isCriticalBadge: true },
      { key: 'status', label: 'Status', isStatus: true },
    ]
  },
  deliverables: {
    title: 'Deliverable Register',
    service: deliverableService,
    fields: [
      { name: 'project_id', label: 'Project', type: 'project_select', required: true },
      { name: 'name', label: 'Deliverable Name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['REPORT', 'SURVEY', 'DESIGN', 'TRAINING', 'SOFTWARE', 'DOCUMENTATION', 'OTHER'], required: true },
      { name: 'planned_date', label: 'Planned Date', type: 'date', required: true },
      { name: 'actual_date', label: 'Actual Date', type: 'date' },
      { name: 'responsible_person', label: 'Responsible Person', type: 'text' },
      { name: 'is_critical', label: 'Critical Deliverable?', type: 'checkbox' },
      { name: 'status', label: 'Status', type: 'select', options: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'AT_RISK', 'CANCELLED'] },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
    columns: [
      { key: 'name', label: 'Deliverable Name', bold: true },
      { key: 'category', label: 'Category', isBadge: true },
      { key: 'planned_date', label: 'Planned Date', format: v => v ? format(new Date(v), 'dd MMM yyyy') : '—' },
      { key: 'actual_date', label: 'Actual Date', format: v => v ? format(new Date(v), 'dd MMM yyyy') : '—' },
      { key: 'responsible_person', label: 'Responsible' },
      { key: 'is_critical', label: 'Critical', format: v => v ? 'YES' : 'NO', isCriticalBadge: true },
      { key: 'status', label: 'Status', isStatus: true },
    ]
  },
  financials: {
    title: 'Financial Monitoring Register',
    service: financialService,
    fields: [
      { name: 'project_id', label: 'Project', type: 'project_select', required: true },
      { name: 'reporting_month', label: 'Reporting Month', type: 'date', required: true },
      { name: 'original_contract_value', label: 'Original Contract Value ($)', type: 'number' },
      { name: 'variation_value', label: 'Variation Value ($)', type: 'number' },
      { name: 'planned_invoicing', label: 'Planned Invoicing ($)', type: 'number' },
      { name: 'actual_invoicing', label: 'Actual Invoicing ($)', type: 'number' },
      { name: 'amount_certified', label: 'Amount Certified ($)', type: 'number' },
      { name: 'amount_received', label: 'Amount Received ($)', type: 'number' },
      { name: 'planned_cost', label: 'Planned Cost ($)', type: 'number' },
      { name: 'actual_cost', label: 'Actual Cost ($)', type: 'number' },
    ],
    columns: [
      { key: 'reporting_month', label: 'Month', format: v => v ? format(new Date(v), 'MMM yyyy') : '—', color: 'blue.300' },
      { key: 'revised_contract_value', label: 'Revised Value', format: v => v != null ? (Number(v) < 0 ? `-$${Math.abs(Number(v)).toLocaleString()}` : `$${Number(v).toLocaleString()}`) : '—' },
      { key: 'planned_invoicing', label: 'Planned Inv.', format: v => v != null ? (Number(v) < 0 ? `-$${Math.abs(Number(v)).toLocaleString()}` : `$${Number(v).toLocaleString()}`) : '—' },
      { key: 'actual_invoicing', label: 'Actual Inv.', format: v => v != null ? (Number(v) < 0 ? `-$${Math.abs(Number(v)).toLocaleString()}` : `$${Number(v).toLocaleString()}`) : '—' },
      { key: 'amount_certified', label: 'Certified', format: v => v != null ? (Number(v) < 0 ? `-$${Math.abs(Number(v)).toLocaleString()}` : `$${Number(v).toLocaleString()}`) : '—' },
      { key: 'amount_received', label: 'Received', format: v => v != null ? (Number(v) < 0 ? `-$${Math.abs(Number(v)).toLocaleString()}` : `$${Number(v).toLocaleString()}`) : '—', color: 'green.300' },
      { key: 'outstanding_payment', label: 'Outstanding', format: v => v != null ? (Number(v) < 0 ? `-$${Math.abs(Number(v)).toLocaleString()}` : `$${Number(v).toLocaleString()}`) : '—', color: v => Number(v) < 0 ? 'red.400' : 'orange.400' },
      { key: 'planned_cost', label: 'Planned Cost', format: v => v != null ? (Number(v) < 0 ? `-$${Math.abs(Number(v)).toLocaleString()}` : `$${Number(v).toLocaleString()}`) : '—' },
      { key: 'actual_cost', label: 'Actual Cost', format: v => v != null ? (Number(v) < 0 ? `-$${Math.abs(Number(v)).toLocaleString()}` : `$${Number(v).toLocaleString()}`) : '—' },
      {
        key: '_cost_diff',
        label: 'Cost Difference',
        computed: row => {
          const planned = parseFloat(row.planned_cost) || 0;
          const actual  = parseFloat(row.actual_cost)  || 0;
          if (!planned && !actual) return null;
          return actual - planned;
        },
        format: v => {
          if (v === null) return '—';
          const sign = v > 0 ? '-' : v < 0 ? '+' : '';
          return `${sign}$${Math.abs(v).toLocaleString()}`;
        },
        color: v => v === null ? 'gray.400' : v > 0 ? 'red.400' : 'green.400',
      },
    ]
  },
  risks: {
    title: 'Risk Register',
    service: riskService,
    fields: [
      { name: 'project_id', label: 'Project', type: 'project_select', required: true },
      { name: 'risk_code', label: 'Risk Code', type: 'text', required: true },
      { name: 'description', label: 'Risk Description', type: 'textarea', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'probability', label: 'Probability', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH'], required: true },
      { name: 'impact', label: 'Impact', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH'], required: true },
      { name: 'mitigation_action', label: 'Mitigation Action', type: 'textarea' },
      { name: 'responsible_person', label: 'Responsible Person', type: 'text' },
      { name: 'target_date', label: 'Target Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['OPEN', 'MITIGATING', 'CLOSED', 'ESCALATED'] },
    ],
    columns: [
      { key: 'risk_code', label: 'Code', bold: true, color: 'blue.300' },
      { key: 'description', label: 'Description' },
      { key: 'probability', label: 'Prob', isStatus: true },
      { key: 'impact', label: 'Impact', isStatus: true },
      { key: 'rating', label: 'Score', isRatingBadge: true },
      { key: 'responsible_person', label: 'Owner' },
      { key: 'status', label: 'Status', isStatus: true },
    ]
  },
  issues: {
    title: 'Issue Register',
    service: issueService,
    fields: [
      { name: 'project_id', label: 'Project', type: 'project_select', required: true },
      { name: 'issue_code', label: 'Issue Code', type: 'text', required: true },
      { name: 'description', label: 'Description (What Happened)', type: 'textarea', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'severity', label: 'Severity', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
      { name: 'impact', label: 'Impact', type: 'textarea' },
      { name: 'action_required', label: 'Action Required', type: 'textarea' },
      { name: 'responsible_person', label: 'Responsible Person', type: 'text' },
      { name: 'target_date', label: 'Target Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED'] },
    ],
    columns: [
      { key: 'issue_code', label: 'Code', bold: true, color: 'orange.300' },
      { key: 'description', label: 'Description' },
      { key: 'severity', label: 'Severity', isStatus: true },
      { key: 'action_required', label: 'Action Required' },
      { key: 'responsible_person', label: 'Owner' },
      { key: 'status', label: 'Status', isStatus: true },
    ]
  },
  resources: {
    title: 'Resource & Staffing Register',
    service: resourceService,
    fields: [
      { name: 'project_id', label: 'Project', type: 'project_select', required: true },
      { name: 'resource_type', label: 'Type', type: 'select', options: ['HUMAN_RESOURCE', 'VEHICLE', 'EQUIPMENT', 'SUBCONSULTANT', 'OTHER'], required: true },
      { name: 'resource_name', label: 'Resource Name / Position', type: 'text', required: true },
      { name: 'required_quantity', label: 'Required Quantity', type: 'number', required: true },
      { name: 'available_quantity', label: 'Available Quantity', type: 'number', required: true },
      { name: 'operational_quantity', label: 'Operational Quantity', type: 'number' },
      { name: 'notes', label: 'Notes / Deficit Impact', type: 'textarea' },
    ],
    columns: [
      { key: 'resource_type', label: 'Type', isBadge: true },
      { key: 'resource_name', label: 'Name / Item', bold: true },
      { key: 'required_quantity', label: 'Required' },
      { key: 'available_quantity', label: 'Available' },
      { key: 'operational_quantity', label: 'Operational' },
      { key: 'shortfall', label: 'Shortfall', color: v => v > 0 ? 'red.400' : 'green.400' },
      { key: 'notes', label: 'Notes' },
    ]
  },
  interventions: {
    title: 'Management Intervention Register',
    service: interventionService,
    fields: [
      { name: 'project_id', label: 'Project', type: 'project_select', required: true },
      { name: 'priority', label: 'Priority', type: 'select', options: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], required: true },
      { name: 'problem', label: 'Problem Statement', type: 'textarea', required: true },
      { name: 'impact', label: 'Operational / Financial Impact', type: 'textarea' },
      { name: 'required_decision', label: 'Decision Required by Management', type: 'textarea', required: true },
      { name: 'responsible_person', label: 'Responsible Executive / Person', type: 'text' },
      { name: 'deadline', label: 'Decision Deadline', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED'] },
    ],
    columns: [
      { key: 'priority', label: 'Priority', isStatus: true },
      { key: 'problem', label: 'Problem' },
      { key: 'required_decision', label: 'Required Decision', color: 'yellow.300' },
      { key: 'responsible_person', label: 'Responsible' },
      { key: 'deadline', label: 'Deadline', format: v => v ? format(new Date(v), 'dd MMM yyyy') : '—', color: 'red.300' },
      { key: 'status', label: 'Status', isStatus: true },
    ]
  },
  recovery: {
    title: 'Recovery Plan Monitoring',
    service: recoveryService,
    fields: [
      { name: 'project_id', label: 'Project', type: 'project_select', required: true },
      { name: 'original_gap', label: 'Original Gap (%)', type: 'number', required: true },
      { name: 'recovery_target_gap', label: 'Recovery Target Gap (%)', type: 'number', required: true },
      { name: 'current_gap', label: 'Current Gap (%)', type: 'number', required: true },
      { name: 'recovery_status', label: 'Recovery Status', type: 'select', options: ['NOT_STARTED', 'IMPROVING', 'ON_TRACK', 'AT_RISK', 'FAILED', 'COMPLETED'] },
      { name: 'recovery_action', label: 'Action Plan', type: 'textarea', required: true },
      { name: 'responsible_person', label: 'Responsible Person', type: 'text' },
      { name: 'target_date', label: 'Target Completion Date', type: 'date' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: [
      { key: 'original_gap', label: 'Original Gap', format: v => `${v}%`, color: 'red.400' },
      { key: 'recovery_target_gap', label: 'Target Gap', format: v => `${v}%`, color: 'yellow.400' },
      { key: 'current_gap', label: 'Current Gap', format: v => `${v}%`, color: 'orange.400' },
      { key: 'recovery_status', label: 'Status', isStatus: true },
      { key: 'responsible_person', label: 'Owner' },
      { key: 'target_date', label: 'Target Date', format: v => v ? format(new Date(v), 'dd MMM yyyy') : '—' },
    ]
  },
  'forward-look': {
    title: '30 / 60 / 90-Day Forward Look Register',
    service: forwardLookService,
    fields: [
      { name: 'project_id', label: 'Project', type: 'project_select', required: true },
      { name: 'period', label: 'Lookahead Period', type: 'select', options: ['NEXT_30_DAYS', 'NEXT_60_DAYS', 'NEXT_90_DAYS'], required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['MILESTONE', 'DELIVERABLE', 'INVOICE', 'PROCUREMENT', 'RESOURCE', 'DECISION', 'CONTRACTUAL_DEADLINE', 'RISK', 'OTHER'], required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'expected_date', label: 'Expected Date', type: 'date' },
      { name: 'responsible_person', label: 'Responsible Person', type: 'text' },
      { name: 'impact', label: 'Impact / Consequence', type: 'textarea' },
    ],
    columns: [
      { key: 'period', label: 'Period', isBadge: true },
      { key: 'category', label: 'Category', isBadge: true },
      { key: 'description', label: 'Description' },
      { key: 'expected_date', label: 'Expected Date', format: v => v ? format(new Date(v), 'dd MMM yyyy') : '—' },
      { key: 'responsible_person', label: 'Owner' },
    ]
  },
  users: {
    title: 'User Administration',
    service: userService,
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email Address', type: 'email', required: true },
      { name: 'role', label: 'System Role', type: 'select', options: ['ADMIN', 'TRANSPORT_MANAGER', 'PLANNING_MANAGER', 'PROJECT_MANAGER', 'FINANCE', 'VIEWER'], required: true },
    ],
    columns: [
      { key: 'name', label: 'Name', bold: true },
      { key: 'email', label: 'Email', color: 'blue.300' },
      { key: 'role', label: 'Role', isBadge: true },
      { key: 'created_at', label: 'Created', format: v => v ? format(new Date(v), 'dd MMM yyyy') : '—' },
    ]
  },
  insurances: {
    title: 'Insurance Register',
    service: insuranceService,
    fields: [
      { name: 'project_id', label: 'Project', type: 'project_select', required: true },
      { name: 'insurance_type', label: 'Insurance Type', type: 'select', options: ['ADVANCE_GUARANTEE', 'PROFESSIONAL_INDEMNITY', 'PERFORMANCE_BOND', 'OTHER'], required: true },
      { name: 'insurer', label: 'Insurer', type: 'text', required: true },
      { name: 'start_date', label: 'Start Date', type: 'date', required: true },
      { name: 'expiry_date', label: 'Expiry Date', type: 'date', required: true },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: [
      { key: 'insurance_type', label: 'Type', isBadge: true },
      { key: 'insurer', label: 'Insurer', bold: true },
      { key: 'start_date', label: 'Start Date', format: v => v ? format(new Date(v), 'dd MMM yyyy') : '—' },
      { key: 'expiry_date', label: 'Expiry Date', format: v => v ? format(new Date(v), 'dd MMM yyyy') : '—' },
      { key: 'remaining_months', label: 'Remaining Months', format: v => v != null ? `${v} month${v === 1 ? '' : 's'}` : '—', color: v => v <= 1 ? 'red.400' : v <= 3 ? 'orange.400' : 'green.400' },
      { key: 'notes', label: 'Notes' },
    ]
  }
};

export default function GenericRegisterPage({ registerType }) {
  const config = CONFIGS[registerType] || CONFIGS.contracts;
  const { hasRole, user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const resourceTypeFilter = searchParams.get('type');

  const cancelDeleteRef = useRef(null);

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm();

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [data, projs] = await Promise.all([
        config.service.getAll(selectedProject ? { project_id: selectedProject } : {}),
        projectService.getAll(),
      ]);
      setItems(data);
      setProjects(projs);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [config.service, selectedProject]);

  useEffect(() => { load(); }, [load]);

  const handleOpenAdd = () => {
    setEditItem(null);
    const defaults = { is_critical: false };
    if (registerType === 'resources') {
      defaults.resource_type = resourceTypeFilter || '';
    }
    reset(defaults);
    onOpen();
  };

  const handleOpenEdit = (item) => {
    setEditItem(item);
    reset(item);
    onOpen();
  };

  const onSubmit = async (values) => {
    setSaving(true);
    const payload = { ...values };
    config.fields.forEach(field => {
      if (field.type === 'checkbox') {
        payload[field.name] = !!payload[field.name];
      }
    });
    try {
      if (editItem) {
        await config.service.update(editItem.id, payload);
        toast({ title: 'Record updated successfully', status: 'success' });
      } else {
        await config.service.create(payload);
        toast({ title: 'Record created successfully', status: 'success' });
      }
      onClose();
      load();
    } catch (err) {
      toast({
        title: 'Operation Failed',
        description: err?.response?.data?.message || err.message,
        status: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (item, e) => {
    e?.stopPropagation?.();
    setDeleteTarget(item);
    onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await config.service.remove(deleteTarget.id);
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
      toast({ title: 'Record deleted', status: 'success', duration: 3000, isClosable: true });
      onDeleteClose();
      setDeleteTarget(null);
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err?.response?.data?.message || err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (deleting) return;
    onDeleteClose();
    setDeleteTarget(null);
  };

  const filteredItems = items.filter(item => {
    if (registerType === 'resources' && resourceTypeFilter) {
      if (item.resource_type !== resourceTypeFilter) return false;
    }

    if (!search) return true;
    const q = search.toLowerCase();
    const proj = item.Project || projects.find(p => String(p.id) === String(item.project_id));
    const projMatch = proj ? (proj.project_code?.toLowerCase().includes(q) || proj.project_name?.toLowerCase().includes(q)) : false;
    const valuesMatch = Object.values(item).some(v => typeof v === 'string' && v.toLowerCase().includes(q));
    return projMatch || valuesMatch;
  });

  return (
    <Box>
      <PageHeader
        title={registerType === 'resources' && resourceTypeFilter ? `${resourceTypeFilter.replace(/_/g, ' ')} Register` : config.title}
        subtitle={`${filteredItems.length} records in register`}
        actions={
          hasRole('ADMIN', 'PLANNING_MANAGER', 'PROJECT_MANAGER', 'FINANCE') && (
            <Button leftIcon={<AddIcon />} colorScheme="blue" size="sm" onClick={handleOpenAdd}>
              Add Record
            </Button>
          )
        }
      />

      {/* Filters */}
      <HStack spacing={3} mb={5} wrap="wrap">
        <InputGroup size="sm" maxW="280px">
          <InputLeftElement pointerEvents="none"><SearchIcon color="gray.500" /></InputLeftElement>
          <Input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            bg="gray.800"
            border="1px solid"
            borderColor="whiteAlpha.200"
          />
        </InputGroup>
        {registerType !== 'users' && (
          <Select
            size="sm"
            placeholder="All Projects"
            maxW="240px"
            bg="gray.800"
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id} style={{ background: '#1a202c' }}>
                {p.project_code} - {p.project_name}
              </option>
            ))}
          </Select>
        )}
      </HStack>

      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <Box bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden">
          <Box overflowX="auto">
            <Table size="sm" variant="unstyled">
              <Thead>
                <Tr borderBottom="2px solid" borderColor="whiteAlpha.100">
                  {registerType !== 'users' && <Th color="gray.500" fontSize="10px" py={3}>Project</Th>}
                  {config.columns.map(col => (
                    <Th key={col.key} color="gray.500" fontSize="10px" py={3}>{col.label}</Th>
                  ))}
                  {hasRole('ADMIN', 'TRANSPORT_MANAGER', 'PLANNING_MANAGER', 'PROJECT_MANAGER', 'FINANCE') && (
                    <Th color="gray.500" fontSize="10px" py={3} textAlign="right">Actions</Th>
                  )}
                </Tr>
              </Thead>
              <Tbody>
                {filteredItems.length === 0 && (
                  <Tr><Td colSpan={config.columns.length + 2}><EmptyState message="No records found." /></Td></Tr>
                )}
                {filteredItems.map(item => (
                  <Tr key={item.id} borderBottom="1px solid" borderColor="whiteAlpha.50" _hover={{ bg: 'whiteAlpha.100' }}>
                    {registerType !== 'users' && (
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs" fontWeight="700" color="blue.300">
                            {item.Project?.project_code || projects.find(p => String(p.id) === String(item.project_id))?.project_code || '—'}
                          </Text>
                          <Text fontSize="10px" color="gray.400" maxW="160px" isTruncated>
                            {item.Project?.project_name || projects.find(p => String(p.id) === String(item.project_id))?.project_name || ''}
                          </Text>
                        </VStack>
                      </Td>
                    )}
                    {config.columns.map(col => {
                      const val = col.computed ? col.computed(item) : item[col.key];
                      const formatted = col.format ? col.format(val, item) : val;
                      const textColor = typeof col.color === 'function' ? col.color(val) : col.color || 'white';
                      return (
                        <Td key={col.key} maxW="250px">
                          {col.isStatus ? (
                            <StatusBadge status={val} size="xs" />
                          ) : col.isBadge ? (
                            <Badge colorScheme="purple" fontSize="9px">{val?.replace(/_/g, ' ')}</Badge>
                          ) : col.isCriticalBadge ? (
                            val ? <Badge colorScheme="red" fontSize="9px">CRITICAL</Badge> : <Text fontSize="xs" color="gray.500">NO</Text>
                          ) : col.isRatingBadge ? (
                            <Badge colorScheme={val >= 6 ? 'red' : val >= 3 ? 'yellow' : 'green'} borderRadius="full" px={2} fontWeight="800">
                              {val}
                            </Badge>
                          ) : (
                            <Text fontSize="xs" fontWeight={col.bold ? '700' : '400'} color={textColor} noOfLines={2}>
                              {formatted ?? '—'}
                            </Text>
                          )}
                        </Td>
                      );
                    })}
                    {hasRole('ADMIN', 'TRANSPORT_MANAGER', 'PLANNING_MANAGER', 'PROJECT_MANAGER', 'FINANCE') && (
                      <Td textAlign="right">
                        <HStack spacing={1} justify="flex-end">
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={(e) => { e.stopPropagation(); handleOpenEdit(item); }}
                            aria-label="Edit"
                          />
                          {hasRole('ADMIN', 'TRANSPORT_MANAGER', 'PLANNING_MANAGER') && (
                            <IconButton
                              icon={<DeleteIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              isLoading={deleting && deleteTarget?.id === item.id}
                              isDisabled={deleting}
                              onClick={(e) => handleDeleteClick(item, e)}
                              aria-label="Delete"
                            />
                          )}
                        </HStack>
                      </Td>
                    )}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={handleDeleteCancel}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.700">
          <AlertDialogContent bg="gray.900" border="1px solid" borderColor="whiteAlpha.200" color="white">
            <AlertDialogHeader fontSize="md" fontWeight="800">Delete Record</AlertDialogHeader>
            <AlertDialogBody fontSize="sm" color="gray.300">
              Are you sure you want to delete this record? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelDeleteRef} variant="ghost" mr={3} onClick={handleDeleteCancel} isDisabled={deleting}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} isLoading={deleting} loadingText="Deleting...">
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Data Entry Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay bg="blackAlpha.700" />
        <ModalContent bg="gray.900" border="1px solid" borderColor="whiteAlpha.200" color="white">
          <ModalHeader fontSize="md" fontWeight="800">
            {editItem ? 'Edit Record' : `Add ${config.title}`}
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {config.fields.map(field => (
                  <FormControl key={field.name} isRequired={field.required} isInvalid={!!errors[field.name]}>
                    {field.type !== 'checkbox' && (
                      <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase">{field.label}</FormLabel>
                    )}
                    {field.type === 'project_select' ? (
                      <Select bg="gray.800" placeholder="Select Project" {...register(field.name, { required: field.required })}>
                        {projects.map(p => (
                          <option key={p.id} value={p.id} style={{ background: '#1a202c' }}>
                            {p.project_code} - {p.project_name}
                          </option>
                        ))}
                      </Select>
                    ) : field.type === 'select' ? (
                      <Select bg="gray.800" {...register(field.name, { required: field.required })}>
                        {field.options.map(opt => (
                          <option key={opt} value={opt} style={{ background: '#1a202c' }}>{opt}</option>
                        ))}
                      </Select>
                    ) : field.type === 'textarea' ? (
                      <Textarea bg="gray.800" {...register(field.name, { required: field.required })} />
                    ) : field.type === 'checkbox' ? (
                      <Controller
                        name={field.name}
                        control={control}
                        defaultValue={false}
                        render={({ field: ctrlField }) => (
                          <Checkbox
                            colorScheme="blue"
                            isChecked={!!ctrlField.value}
                            onChange={(e) => ctrlField.onChange(e.target.checked)}
                          >
                            <Text fontSize="xs" color="gray.300">{field.label}</Text>
                          </Checkbox>
                        )}
                      />
                    ) : (
                      <Input
                        type={field.type}
                        step={field.type === 'number' ? 'any' : undefined}
                        bg="gray.800"
                        {...register(field.name, { required: field.required })}
                      />
                    )}
                    <FormErrorMessage>{errors[field.name]?.message}</FormErrorMessage>
                  </FormControl>
                ))}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
              <Button type="submit" colorScheme="blue" isLoading={saving}>Save</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
}
