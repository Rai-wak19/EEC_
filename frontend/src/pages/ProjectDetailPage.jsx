import {
  Box, Text, Flex, Tabs, TabList, Tab, TabPanels, TabPanel,
  SimpleGrid, Grid, Table, Thead, Tbody, Tr, Th, Td,
  Button, HStack, VStack, Divider, Badge, Tooltip,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure, FormControl, FormLabel, Input,
  Select, Textarea, FormErrorMessage, useToast, Checkbox,
} from '@chakra-ui/react';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditIcon } from '@chakra-ui/icons';
import { useForm, Controller } from 'react-hook-form';
import {
  projectService, progressService, milestoneService, deliverableService,
  financialService, riskService, issueService, resourceService,
  interventionService, recoveryService, forwardLookService, contractService,
  insuranceService, slaService,
} from '../services/services';
import { HealthBadge, StatusBadge } from '../components/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '../components/States';
import { PageHeader, SectionCard } from '../components/Layout';
import { ProgressBar } from '../components/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const fmtPct = (v) => v != null ? `${Number(v).toFixed(1)}%` : '—';
const fmtSPI = (v) => v != null ? Number(v).toFixed(2) : '—';
const fmtUSD = (v) => {
  if (v == null) return '—';
  const num = Number(v);
  return num < 0 ? `-$${Math.abs(num).toLocaleString()}` : `$${num.toLocaleString()}`;
};
const fmtDate = (d) => d ? format(new Date(d), 'dd MMM yyyy') : '—';

const InfoRow = ({ label, value, color }) => (
  <Flex justify="space-between" align="center" py={2} borderBottom="1px solid" borderColor="whiteAlpha.50">
    <Text fontSize="xs" color="gray.500">{label}</Text>
    <Text fontSize="xs" fontWeight="600" color={color || 'white'}>{value || '—'}</Text>
  </Flex>
);

const MODAL_CONFIGS = {
  progress: {
    title: 'Add Monthly Progress',
    service: progressService,
    fields: [
      { name: 'reporting_month', label: 'Reporting Month', type: 'date', required: true },
      { name: 'planned_progress', label: 'Planned Progress (%)', type: 'number', required: true },
      { name: 'actual_progress', label: 'Actual Progress (%)', type: 'number', required: true },
      { name: 'time_elapsed_percent', label: 'Time Elapsed (%)', type: 'number' },
      { name: 'notes', label: 'Progress Notes', type: 'textarea' },
    ]
  },
  milestones: {
    title: 'Add Milestone',
    service: milestoneService,
    fields: [
      { name: 'name', label: 'Milestone Name', type: 'text', required: true },
      { name: 'planned_date', label: 'Planned Date', type: 'date', required: true },
      { name: 'actual_date', label: 'Actual Date', type: 'date' },
      { name: 'responsible_person', label: 'Responsible Person', type: 'text' },
      { name: 'is_critical', label: 'Critical Milestone?', type: 'checkbox' },
      { name: 'status', label: 'Status', type: 'select', options: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'AT_RISK', 'CANCELLED'], defaultValue: 'NOT_STARTED' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  deliverables: {
    title: 'Add Deliverable',
    service: deliverableService,
    fields: [
      { name: 'name', label: 'Deliverable Name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['REPORT', 'SURVEY', 'DESIGN', 'TRAINING', 'SOFTWARE', 'DOCUMENTATION', 'OTHER'], required: true },
      { name: 'planned_date', label: 'Planned Date', type: 'date', required: true },
      { name: 'actual_date', label: 'Actual Date', type: 'date' },
      { name: 'responsible_person', label: 'Responsible Person', type: 'text' },
      { name: 'is_critical', label: 'Critical Deliverable?', type: 'checkbox' },
      { name: 'status', label: 'Status', type: 'select', options: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'AT_RISK', 'CANCELLED'], defaultValue: 'PLANNED' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ]
  },
  financials: {
    title: 'Add Financial Record',
    service: financialService,
    fields: [
      { name: 'reporting_month', label: 'Reporting Month', type: 'date', required: true },
      { name: 'original_contract_value', label: 'Original Contract Value ($)', type: 'number' },
      { name: 'variation_value', label: 'Variation Value ($)', type: 'number' },
      { name: 'planned_invoicing', label: 'Planned Invoicing ($)', type: 'number' },
      { name: 'actual_invoicing', label: 'Actual Invoicing ($)', type: 'number' },
      { name: 'amount_certified', label: 'Amount Certified ($)', type: 'number' },
      { name: 'amount_received', label: 'Amount Received ($)', type: 'number' },
      { name: 'planned_cost', label: 'Planned Cost ($)', type: 'number' },
      { name: 'actual_cost', label: 'Actual Cost ($)', type: 'number' },
    ]
  },
  resources: {
    title: 'Add Resource',
    service: resourceService,
    fields: [
      { name: 'resource_type', label: 'Resource Type', type: 'select', options: ['HUMAN_RESOURCE', 'VEHICLE', 'EQUIPMENT', 'SUBCONSULTANT', 'OTHER'], required: true },
      { name: 'resource_name', label: 'Resource Name', type: 'text', required: true },
      { name: 'required_quantity', label: 'Required Quantity', type: 'number', required: true },
      { name: 'available_quantity', label: 'Available Quantity', type: 'number', required: true },
      { name: 'operational_quantity', label: 'Operational Quantity', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  risks: {
    title: 'Add Risk',
    service: riskService,
    fields: [
      { name: 'risk_code', label: 'Risk Code (e.g. RSK-001)', type: 'text', required: true },
      { name: 'description', label: 'Risk Description', type: 'textarea', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'probability', label: 'Probability', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH'], required: true },
      { name: 'impact', label: 'Impact', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH'], required: true },
      { name: 'mitigation_action', label: 'Mitigation Action', type: 'textarea' },
      { name: 'responsible_person', label: 'Responsible Person', type: 'text' },
      { name: 'target_date', label: 'Target Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['OPEN', 'MITIGATING', 'CLOSED', 'ESCALATED'], defaultValue: 'OPEN' },
    ]
  },
  insurances: {
    title: 'Add Insurance Record',
    service: insuranceService,
    fields: [
      { name: 'insurance_type', label: 'Insurance Type', type: 'select', options: ['ADVANCE_GUARANTEE', 'PROFESSIONAL_INDEMNITY', 'PERFORMANCE_BOND', 'OTHER'], required: true },
      { name: 'insurer', label: 'Insurer', type: 'text', required: true },
      { name: 'start_date', label: 'Start Date', type: 'date', required: true },
      { name: 'expiry_date', label: 'Expiry Date', type: 'date', required: true },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  issues: {
    title: 'Add Issue',
    service: issueService,
    fields: [
      { name: 'issue_code', label: 'Issue Code (e.g. ISS-001)', type: 'text', required: true },
      { name: 'description', label: 'Issue Description', type: 'textarea', required: true },
      { name: 'severity', label: 'Severity', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
      { name: 'impact', label: 'Impact Details', type: 'textarea' },
      { name: 'action_required', label: 'Action Required', type: 'textarea' },
      { name: 'responsible_person', label: 'Responsible Person', type: 'text' },
      { name: 'target_date', label: 'Target Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'ESCALATED'], defaultValue: 'OPEN' },
    ]
  }
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { hasRole } = useAuth();
  const toast = useToast();

  const [project, setProject]       = useState(null);
  const [progress, setProgress]     = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [financials, setFinancials] = useState([]);
  const [risks, setRisks]           = useState([]);
  const [issues, setIssues]         = useState([]);
  const [resources, setResources]   = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [recovery, setRecovery]     = useState([]);
  const [forwardLook, setForwardLook] = useState([]);
  const [contracts, setContracts]   = useState([]);
  const [insurances, setInsurances] = useState([]);
  const [slas, setSlas]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // Modal State
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalType, setModalType] = useState('progress');
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm();

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [p, prog, ms, del, fin, r, iss, res, inv, rec, fl, con, ins, sl] = await Promise.all([
        projectService.getById(id),
        progressService.getAll({ project_id: id }),
        milestoneService.getAll({ project_id: id }),
        deliverableService.getAll({ project_id: id }),
        financialService.getAll({ project_id: id }),
        riskService.getAll({ project_id: id }),
        issueService.getAll({ project_id: id }),
        resourceService.getAll({ project_id: id }),
        interventionService.getAll({ project_id: id }),
        recoveryService.getAll({ project_id: id }),
        forwardLookService.getAll({ project_id: id }),
        contractService.getAll({ project_id: id }),
        insuranceService.getAll({ project_id: id }),
        slaService.getAll({ project_id: id }),
      ]);
      setProject(p); setProgress(prog); setMilestones(ms); setDeliverables(del);
      setFinancials(fin); setRisks(r); setIssues(iss); setResources(res);
      setInterventions(inv); setRecovery(rec); setForwardLook(fl); setContracts(con); setInsurances(ins); setSlas(sl);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleOpenModal = (type) => {
    setModalType(type);
    reset({});
    onOpen();
  };

  const handleModalSubmit = async (values) => {
    setSaving(true);
    const payload = { ...values };
    const activeConfig = MODAL_CONFIGS[modalType];
    activeConfig?.fields.forEach(field => {
      if (field.type === 'checkbox') {
        payload[field.name] = !!payload[field.name];
      }
    });
    try {
      if (!activeConfig) return;
      await activeConfig.service.create({
        ...payload,
        project_id: Number(id),
      });
      toast({ title: `${activeConfig.title} record added successfully`, status: 'success' });
      onClose();
      load();
    } catch (err) {
      toast({
        title: 'Failed to add record',
        description: err?.response?.data?.message || err.message,
        status: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading project..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!project) return <EmptyState message="Project not found." />;

  const openRisks   = risks.filter(r => ['OPEN','ESCALATED','MITIGATING'].includes(r.status)).length;
  const openIssues  = issues.filter(i => ['OPEN','IN_PROGRESS','ESCALATED'].includes(i.status)).length;
  const delayedMS   = milestones.filter(m => m.status === 'DELAYED').length;
  const delayedDel  = deliverables.filter(d => d.status === 'DELAYED').length;

  const currentModalConfig = MODAL_CONFIGS[modalType] || MODAL_CONFIGS.progress;

  return (
    <Box>
      <PageHeader
        title={project.project_name}
        subtitle={`${project.project_code} · ${project.client}`}
        actions={
          <HStack spacing={2}>
            <HealthBadge status={project.health_status} />
            {hasRole('ADMIN', 'PLANNING_MANAGER') && (
              <Button leftIcon={<EditIcon />} size="sm" variant="outline" colorScheme="blue"
                onClick={() => nav(`/projects/${id}/edit`)}>
                Edit Project
              </Button>
            )}
            <Button size="sm" variant="ghost" colorScheme="gray" onClick={() => nav('/projects')}>
              ← Back
            </Button>
          </HStack>
        }
      />

      {/* Overview KPI Strip */}
      <SimpleGrid columns={{ base: 2, md: 4, lg: 8 }} spacing={3} mb={6}>
        {[
          { label: 'Planned', value: fmtPct(project.latest_planned), color: 'gray.300' },
          { label: 'Actual',  value: fmtPct(project.latest_actual),  color: project.health_status === 'GREEN' ? 'green.400' : project.health_status === 'RED' ? 'red.400' : 'yellow.400' },
          { label: 'Variance', value: project.schedule_variance != null ? `${Number(project.schedule_variance) >= 0 ? '+' : ''}${Number(project.schedule_variance).toFixed(1)}%` : '—', color: project.schedule_variance < 0 ? 'red.400' : 'green.400' },
          { label: 'SPI',     value: fmtSPI(project.spi),            color: project.spi < 0.80 ? 'red.400' : project.spi < 0.95 ? 'yellow.400' : 'green.400' },
          { label: 'Financial', value: fmtPct(project.financial_progress), color: 'cyan.400' },
          { label: 'Open Risks', value: String(openRisks), color: openRisks > 2 ? 'red.400' : 'orange.400' },
          { label: 'Open Issues', value: String(openIssues), color: openIssues > 0 ? 'red.400' : 'gray.400' },
          { label: 'Contract Value', value: project.contract_value ? `$${(project.contract_value/1e6).toFixed(1)}M` : '—', color: 'blue.300' },
        ].map(kpi => (
          <Box key={kpi.label} bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" p={3}>
            <Text fontSize="9px" color="gray.500" textTransform="uppercase" letterSpacing="0.8px">{kpi.label}</Text>
            <Text fontSize="lg" fontWeight="800" color={kpi.color}>{kpi.value}</Text>
          </Box>
        ))}
      </SimpleGrid>

      {/* Tabs */}
      <Tabs colorScheme="blue" variant="line">
        <TabList borderColor="whiteAlpha.100" mb={5} overflowX="auto">
          {['Overview','Schedule','Milestones','Deliverables','Financial','Resources','Risks','Issues','Interventions','Recovery','Forward Look','Insurance','SLA'].map(t => (
            <Tab key={t} fontSize="sm" color="gray.400" _selected={{ color: 'blue.300', borderColor: 'blue.400' }} whiteSpace="nowrap">
              {t}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {/* ── Overview ──────────────────────────────────── */}
          <TabPanel p={0}>
            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={5}>
              <SectionCard title="Project Information">
                <VStack spacing={0} align="stretch">
                  <InfoRow label="Project Code" value={project.project_code} />
                  <InfoRow label="Client" value={project.client} />
                  <InfoRow label="Employer" value={project.employer} />
                  <InfoRow label="Contract No." value={project.contract_no} />
                  <InfoRow label="Consultant" value={project.consultant} />
                  <InfoRow label="Team" value={project.responsible_team} />
                  <InfoRow label="Project Manager" value={project.project_manager_name || project.project_manager?.name} />
                  <InfoRow label="Contract Signed Date" value={fmtDate(project.contract_signed_date)} />
                  <InfoRow label="Start Date" value={fmtDate(project.commencement_date)} />
                  <InfoRow label="End Date" value={fmtDate(project.completion_date)} />
                  <InfoRow label="Duration" value={project.duration_months ? `${project.duration_months} months` : '—'} />
                  <InfoRow label="Contract Value" value={project.contract_value ? `$${Number(project.contract_value).toLocaleString()} ${project.currency}` : '—'} color="cyan.300" />
                  <InfoRow label="Status" value={<StatusBadge status={project.project_status} />} />
                </VStack>
              </SectionCard>
              <SectionCard title="Performance Summary">
                <VStack spacing={3} align="stretch">
                  <Box>
                    <Text fontSize="xs" color="gray.400" mb={2}>Schedule Performance</Text>
                    <ProgressBar planned={project.latest_planned} actual={project.latest_actual} />
                  </Box>
                  <Divider borderColor="whiteAlpha.100" />
                  <SimpleGrid columns={2} spacing={3}>
                    {[
                      { label: 'Milestones Delayed', value: delayedMS, color: delayedMS > 0 ? 'red.400' : 'green.400' },
                      { label: 'Deliverables Delayed', value: delayedDel, color: delayedDel > 0 ? 'red.400' : 'green.400' },
                      { label: 'Open Risks', value: openRisks, color: openRisks > 2 ? 'red.400' : 'orange.400' },
                      { label: 'Open Issues', value: openIssues, color: openIssues > 0 ? 'red.400' : 'green.400' },
                    ].map(s => (
                      <Box key={s.label} bg="whiteAlpha.50" p={3} borderRadius="lg">
                        <Text fontSize="xs" color="gray.500" mb={1}>{s.label}</Text>
                        <Text fontSize="2xl" fontWeight="800" color={s.color}>{s.value}</Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                </VStack>
              </SectionCard>
            </Grid>
          </TabPanel>

          {/* ── Schedule ──────────────────────────────────── */}
          <TabPanel p={0}>
            <SectionCard title="Monthly Progress History" actions={
              hasRole('ADMIN','PLANNING_MANAGER','PROJECT_MANAGER') && (
                <Button size="xs" colorScheme="blue" onClick={() => handleOpenModal('progress')}>+ Add Progress</Button>
              )
            }>
              <Box overflowX="auto">
                <Table size="sm" variant="unstyled">
                  <Thead><Tr borderBottom="1px solid" borderColor="whiteAlpha.100">
                    {['Month','Planned','Actual','Variance','SPI','Time Elapsed','Notes'].map(h => (
                      <Th key={h} color="gray.500" fontSize="10px" py={2}>{h}</Th>
                    ))}
                  </Tr></Thead>
                  <Tbody>
                    {progress.length === 0 && <Tr><Td colSpan={7}><EmptyState message="No progress records." /></Td></Tr>}
                    {progress.map(r => (
                      <Tr key={r.id} borderBottom="1px solid" borderColor="whiteAlpha.50">
                        <Td><Text fontSize="xs" color="blue.300">{r.reporting_month ? format(new Date(r.reporting_month), 'MMM yyyy') : '—'}</Text></Td>
                        <Td><Text fontSize="xs" color="gray.300">{fmtPct(r.planned_progress)}</Text></Td>
                        <Td><Text fontSize="xs" fontWeight="600" color={r.actual_progress >= r.planned_progress ? 'green.300' : 'red.300'}>{fmtPct(r.actual_progress)}</Text></Td>
                        <Td><Text fontSize="xs" color={r.schedule_variance < -5 ? 'red.400' : r.schedule_variance < 0 ? 'yellow.400' : 'green.400'}>{r.schedule_variance != null ? `${Number(r.schedule_variance) >= 0 ? '+' : ''}${Number(r.schedule_variance).toFixed(1)}%` : '—'}</Text></Td>
                        <Td><Text fontSize="xs" fontWeight="700" color={r.spi < 0.80 ? 'red.400' : r.spi < 0.95 ? 'yellow.400' : 'green.400'}>{fmtSPI(r.spi)}</Text></Td>
                        <Td><Text fontSize="xs" color="gray.400">{fmtPct(r.time_elapsed_percent)}</Text></Td>
                        <Td maxW="200px"><Text fontSize="xs" color="gray.500" noOfLines={2}>{r.notes || '—'}</Text></Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </SectionCard>
          </TabPanel>

          {/* ── Milestones ────────────────────────────────── */}
          <TabPanel p={0}>
            <SectionCard title="Milestone Register" actions={
              hasRole('ADMIN','PLANNING_MANAGER','PROJECT_MANAGER') && (
                <Button size="xs" colorScheme="blue" onClick={() => handleOpenModal('milestones')}>+ Add Milestone</Button>
              )
            }>
              <Box overflowX="auto">
                <Table size="sm" variant="unstyled">
                  <Thead><Tr borderBottom="1px solid" borderColor="whiteAlpha.100">
                    {['Milestone','Planned Date','Actual Date','Responsible','Critical','Status'].map(h => (
                      <Th key={h} color="gray.500" fontSize="10px" py={2}>{h}</Th>
                    ))}
                  </Tr></Thead>
                  <Tbody>
                    {milestones.length === 0 && <Tr><Td colSpan={6}><EmptyState message="No milestones." /></Td></Tr>}
                    {milestones.map(m => (
                      <Tr key={m.id} borderBottom="1px solid" borderColor="whiteAlpha.50" bg={m.is_critical && m.status === 'DELAYED' ? 'rgba(239,68,68,0.04)' : undefined}>
                        <Td><Text fontSize="xs" color="white" fontWeight={m.is_critical ? '700' : '400'}>{m.name}</Text></Td>
                        <Td><Text fontSize="xs" color="gray.400">{fmtDate(m.planned_date)}</Text></Td>
                        <Td><Text fontSize="xs" color="gray.400">{fmtDate(m.actual_date)}</Text></Td>
                        <Td><Text fontSize="xs" color="gray.400">{m.responsible_person}</Text></Td>
                        <Td>{m.is_critical && <Badge colorScheme="red" fontSize="9px">CRITICAL</Badge>}</Td>
                        <Td><StatusBadge status={m.status} size="xs" /></Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </SectionCard>
          </TabPanel>

          {/* ── Deliverables ──────────────────────────────── */}
          <TabPanel p={0}>
            <SectionCard title="Deliverable Register" actions={
              hasRole('ADMIN','PLANNING_MANAGER','PROJECT_MANAGER') && (
                <Button size="xs" colorScheme="blue" onClick={() => handleOpenModal('deliverables')}>+ Add Deliverable</Button>
              )
            }>
              <Box overflowX="auto">
                <Table size="sm" variant="unstyled">
                  <Thead><Tr borderBottom="1px solid" borderColor="whiteAlpha.100">
                    {['Deliverable','Category','Planned Date','Actual Date','Responsible','Critical','Status'].map(h => (
                      <Th key={h} color="gray.500" fontSize="10px" py={2}>{h}</Th>
                    ))}
                  </Tr></Thead>
                  <Tbody>
                    {deliverables.length === 0 && <Tr><Td colSpan={7}><EmptyState message="No deliverables." /></Td></Tr>}
                    {deliverables.map(d => (
                      <Tr key={d.id} borderBottom="1px solid" borderColor="whiteAlpha.50">
                        <Td><Text fontSize="xs" color="white">{d.name}</Text></Td>
                        <Td><Badge colorScheme="blue" fontSize="9px">{d.category}</Badge></Td>
                        <Td><Text fontSize="xs" color="gray.400">{fmtDate(d.planned_date)}</Text></Td>
                        <Td><Text fontSize="xs" color="gray.400">{fmtDate(d.actual_date)}</Text></Td>
                        <Td><Text fontSize="xs" color="gray.400">{d.responsible_person}</Text></Td>
                        <Td>{d.is_critical && <Badge colorScheme="red" fontSize="9px">CRITICAL</Badge>}</Td>
                        <Td><StatusBadge status={d.status} size="xs" /></Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </SectionCard>
          </TabPanel>

          {/* ── Financial ─────────────────────────────────── */}
          <TabPanel p={0}>
            <SectionCard title="Financial Records" actions={
              hasRole('ADMIN','PLANNING_MANAGER','FINANCE') && (
                <Button size="xs" colorScheme="blue" onClick={() => handleOpenModal('financials')}>+ Add Financial Record</Button>
              )
            }>
              <Box overflowX="auto">
                <Table size="sm" variant="unstyled">
                  <Thead><Tr borderBottom="1px solid" borderColor="whiteAlpha.100">
                    {['Month','Contract Value','Planned Inv.','Actual Inv.','Certified','Received','Outstanding','Planned Cost','Actual Cost','Cost Difference','Financial %'].map(h => (
                      <Th key={h} color="gray.500" fontSize="10px" py={2}>{h}</Th>
                    ))}
                  </Tr></Thead>
                  <Tbody>
                    {financials.length === 0 && <Tr><Td colSpan={10}><EmptyState message="No financial records." /></Td></Tr>}
                    {financials.map(f => {
                      const finPct = f.revised_contract_value > 0 ? ((f.amount_received / f.revised_contract_value) * 100).toFixed(1) : '—';
                      const plannedCost = parseFloat(f.planned_cost) || 0;
                      const actualCost  = parseFloat(f.actual_cost)  || 0;
                      const costDiff    = (plannedCost || actualCost) ? actualCost - plannedCost : null;
                      const costDiffColor = costDiff === null ? 'gray.400' : costDiff > 0 ? 'red.400' : 'green.400';
                      const costDiffLabel = costDiff === null ? '—' : `${costDiff > 0 ? '-' : costDiff < 0 ? '+' : ''}$${Math.abs(costDiff).toLocaleString()}`;
                      return (
                        <Tr key={f.id} borderBottom="1px solid" borderColor="whiteAlpha.50">
                          <Td><Text fontSize="xs" color="blue.300">{f.reporting_month ? format(new Date(f.reporting_month), 'MMM yyyy') : '—'}</Text></Td>
                          <Td><Text fontSize="xs" color="cyan.300">{fmtUSD(f.revised_contract_value)}</Text></Td>
                          <Td><Text fontSize="xs" color="gray.300">{fmtUSD(f.planned_invoicing)}</Text></Td>
                          <Td><Text fontSize="xs" color="gray.300">{fmtUSD(f.actual_invoicing)}</Text></Td>
                          <Td><Text fontSize="xs" color="gray.300">{fmtUSD(f.amount_certified)}</Text></Td>
                          <Td><Text fontSize="xs" color="green.300" fontWeight="600">{fmtUSD(f.amount_received)}</Text></Td>
                          <Td><Text fontSize="xs" color={Number(f.outstanding_payment) < 0 ? "red.400" : "orange.400"} fontWeight="600">{fmtUSD(f.outstanding_payment)}</Text></Td>
                          <Td><Text fontSize="xs" color="gray.300">{fmtUSD(f.planned_cost)}</Text></Td>
                          <Td><Text fontSize="xs" color="gray.300">{fmtUSD(f.actual_cost)}</Text></Td>
                          <Td>
                            <Text fontSize="xs" fontWeight="700" color={costDiffColor}>
                              {costDiffLabel}
                            </Text>
                          </Td>
                          <Td><Text fontSize="xs" color="cyan.400" fontWeight="700">{finPct !== '—' ? `${finPct}%` : '—'}</Text></Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            </SectionCard>
          </TabPanel>

          {/* ── Resources ─────────────────────────────────── */}
          <TabPanel p={0}>
            <SectionCard title="Resource Register" actions={
              hasRole('ADMIN','PLANNING_MANAGER','PROJECT_MANAGER') && (
                <Button size="xs" colorScheme="blue" onClick={() => handleOpenModal('resources')}>+ Add Resource</Button>
              )
            }>
              <Box overflowX="auto">
                <Table size="sm" variant="unstyled">
                  <Thead><Tr borderBottom="1px solid" borderColor="whiteAlpha.100">
                    {['Type','Name','Required','Available','Operational','Shortfall','Notes'].map(h => (
                      <Th key={h} color="gray.500" fontSize="10px" py={2}>{h}</Th>
                    ))}
                  </Tr></Thead>
                  <Tbody>
                    {resources.length === 0 && <Tr><Td colSpan={7}><EmptyState message="No resources." /></Td></Tr>}
                    {resources.map(r => (
                      <Tr key={r.id} borderBottom="1px solid" borderColor="whiteAlpha.50" bg={r.shortfall > 0 ? 'rgba(239,68,68,0.04)' : undefined}>
                        <Td><Badge colorScheme="purple" fontSize="9px">{r.resource_type?.replace(/_/g,' ')}</Badge></Td>
                        <Td><Text fontSize="xs" color="white">{r.resource_name}</Text></Td>
                        <Td><Text fontSize="xs" color="gray.300">{r.required_quantity}</Text></Td>
                        <Td><Text fontSize="xs" color="gray.300">{r.available_quantity}</Text></Td>
                        <Td><Text fontSize="xs" color="gray.300">{r.operational_quantity}</Text></Td>
                        <Td><Text fontSize="xs" fontWeight="700" color={r.shortfall > 0 ? 'red.400' : 'green.400'}>{r.shortfall > 0 ? `-${r.shortfall}` : '0'}</Text></Td>
                        <Td maxW="160px"><Text fontSize="xs" color="gray.500" noOfLines={2}>{r.notes || '—'}</Text></Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </SectionCard>
          </TabPanel>

          {/* ── Risks ─────────────────────────────────────── */}
          <TabPanel p={0}>
            <SectionCard title="Risk Register" actions={
              hasRole('ADMIN','PLANNING_MANAGER','PROJECT_MANAGER') && (
                <Button size="xs" colorScheme="blue" onClick={() => handleOpenModal('risks')}>+ Add Risk</Button>
              )
            }>
              <Box overflowX="auto">
                <Table size="sm" variant="unstyled">
                  <Thead><Tr borderBottom="1px solid" borderColor="whiteAlpha.100">
                    {['Code','Description','Prob.','Impact','Score','Mitigation','Owner','Status'].map(h => (
                      <Th key={h} color="gray.500" fontSize="10px" py={2}>{h}</Th>
                    ))}
                  </Tr></Thead>
                  <Tbody>
                    {risks.length === 0 && <Tr><Td colSpan={8}><EmptyState message="No risks." /></Td></Tr>}
                    {risks.map(r => (
                      <Tr key={r.id} borderBottom="1px solid" borderColor="whiteAlpha.50" bg={r.rating >= 6 ? 'rgba(239,68,68,0.04)' : undefined}>
                        <Td><Text fontSize="xs" fontWeight="700" color="blue.300">{r.risk_code}</Text></Td>
                        <Td maxW="200px"><Tooltip label={r.description}><Text fontSize="xs" color="white" noOfLines={2}>{r.description}</Text></Tooltip></Td>
                        <Td><StatusBadge status={r.probability} size="xs" /></Td>
                        <Td><StatusBadge status={r.impact}      size="xs" /></Td>
                        <Td><Badge colorScheme={r.rating >= 6 ? 'red' : r.rating >= 3 ? 'yellow' : 'green'} borderRadius="full" px={2} fontWeight="800">{r.rating}</Badge></Td>
                        <Td maxW="160px"><Tooltip label={r.mitigation_action}><Text fontSize="xs" color="gray.400" noOfLines={2}>{r.mitigation_action || '—'}</Text></Tooltip></Td>
                        <Td><Text fontSize="xs" color="gray.400">{r.responsible_person}</Text></Td>
                        <Td><StatusBadge status={r.status} size="xs" /></Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </SectionCard>
          </TabPanel>

          {/* ── Issues ────────────────────────────────────── */}
          <TabPanel p={0}>
            <SectionCard title="Issue Register" actions={
              hasRole('ADMIN','PLANNING_MANAGER','PROJECT_MANAGER') && (
                <Button size="xs" colorScheme="blue" onClick={() => handleOpenModal('issues')}>+ Add Issue</Button>
              )
            }>
              <Box overflowX="auto">
                <Table size="sm" variant="unstyled">
                  <Thead><Tr borderBottom="1px solid" borderColor="whiteAlpha.100">
                    {['Code','Description','Severity','Impact','Action Required','Owner','Status'].map(h => (
                      <Th key={h} color="gray.500" fontSize="10px" py={2}>{h}</Th>
                    ))}
                  </Tr></Thead>
                  <Tbody>
                    {issues.length === 0 && <Tr><Td colSpan={7}><EmptyState message="No issues." /></Td></Tr>}
                    {issues.map(i => (
                      <Tr key={i.id} borderBottom="1px solid" borderColor="whiteAlpha.50" bg={i.severity === 'CRITICAL' ? 'rgba(239,68,68,0.05)' : undefined}>
                        <Td><Text fontSize="xs" fontWeight="700" color="orange.300">{i.issue_code}</Text></Td>
                        <Td maxW="200px"><Tooltip label={i.description}><Text fontSize="xs" color="white" noOfLines={2}>{i.description}</Text></Tooltip></Td>
                        <Td><StatusBadge status={i.severity} size="xs" /></Td>
                        <Td maxW="160px"><Tooltip label={i.impact}><Text fontSize="xs" color="gray.400" noOfLines={2}>{i.impact || '—'}</Text></Tooltip></Td>
                        <Td maxW="160px"><Tooltip label={i.action_required}><Text fontSize="xs" color="yellow.300" noOfLines={2}>{i.action_required || '—'}</Text></Tooltip></Td>
                        <Td><Text fontSize="xs" color="gray.400">{i.responsible_person}</Text></Td>
                        <Td><StatusBadge status={i.status} size="xs" /></Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </SectionCard>
          </TabPanel>

          {/* ── Interventions ─────────────────────────────── */}
          <TabPanel p={0}>
            <SectionCard title="Management Interventions">
              <VStack spacing={3} align="stretch">
                {interventions.length === 0 && <EmptyState message="No interventions." />}
                {interventions.map(i => (
                  <Box key={i.id} bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" p={4}>
                    <Flex justify="space-between" mb={2} wrap="wrap" gap={2}>
                      <HStack><StatusBadge status={i.priority} /><StatusBadge status={i.status} /></HStack>
                      <Text fontSize="xs" color="gray.500">Deadline: {fmtDate(i.deadline)}</Text>
                    </Flex>
                    <Text fontSize="sm" fontWeight="600" color="white" mb={2}>{i.problem}</Text>
                    <Text fontSize="xs" color="gray.400" mb={2}>{i.impact}</Text>
                    <Box bg="whiteAlpha.50" p={2} borderRadius="md">
                      <Text fontSize="10px" color="gray.500" mb={0.5}>Decision Required</Text>
                      <Text fontSize="xs" color="yellow.300">{i.required_decision}</Text>
                    </Box>
                  </Box>
                ))}
              </VStack>
            </SectionCard>
          </TabPanel>

          {/* ── Recovery ──────────────────────────────────── */}
          <TabPanel p={0}>
            <SectionCard title="Recovery Plans">
              <VStack spacing={3} align="stretch">
                {recovery.length === 0 && <EmptyState message="No recovery plans." />}
                {recovery.map(r => (
                  <Box key={r.id} bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" p={4}>
                    <Flex justify="space-between" mb={3} wrap="wrap" gap={2}>
                      <StatusBadge status={r.recovery_status} />
                      <Text fontSize="xs" color="gray.500">Target: {fmtDate(r.target_date)}</Text>
                    </Flex>
                    <SimpleGrid columns={3} spacing={3} mb={3}>
                      <Box><Text fontSize="10px" color="gray.500">Original Gap</Text><Text fontSize="lg" fontWeight="800" color="red.400">{r.original_gap}%</Text></Box>
                      <Box><Text fontSize="10px" color="gray.500">Target Gap</Text><Text fontSize="lg" fontWeight="800" color="yellow.400">{r.recovery_target_gap}%</Text></Box>
                      <Box><Text fontSize="10px" color="gray.500">Current Gap</Text><Text fontSize="lg" fontWeight="800" color="orange.400">{r.current_gap}%</Text></Box>
                    </SimpleGrid>
                    <Text fontSize="xs" color="gray.400" whiteSpace="pre-line">{r.recovery_action}</Text>
                  </Box>
                ))}
              </VStack>
            </SectionCard>
          </TabPanel>

          {/* ── Forward Look ──────────────────────────────── */}
          <TabPanel p={0}>
            <SectionCard title="Forward Look">
              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                {[['NEXT_30_DAYS','Next 30 Days','red.400'],['NEXT_60_DAYS','Next 60 Days','yellow.400'],['NEXT_90_DAYS','Next 90 Days','blue.400']].map(([period, label, color]) => {
                  const items = forwardLook.filter(i => i.period === period);
                  return (
                    <Box key={period}>
                      <Text fontSize="xs" color={color} fontWeight="700" textTransform="uppercase" letterSpacing="0.8px" mb={3}>{label}</Text>
                      <VStack spacing={2} align="stretch">
                        {items.length === 0 && <Text fontSize="xs" color="gray.600">None.</Text>}
                        {items.map(i => (
                          <Box key={i.id} bg="whiteAlpha.50" p={3} borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100">
                            <Text fontSize="xs" color="white" mb={1}>{i.description}</Text>
                            <Flex justify="space-between">
                              <Badge colorScheme="blue" fontSize="9px">{i.category?.replace(/_/g,' ')}</Badge>
                              <Text fontSize="10px" color="gray.500">{fmtDate(i.expected_date)}</Text>
                            </Flex>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  );
                })}
              </Grid>
            </SectionCard>
          </TabPanel>

          {/* ── Insurance ─────────────────────────────────── */}
          <TabPanel p={0}>
            <SectionCard title="Insurance Register" actions={
              hasRole('ADMIN','PLANNING_MANAGER','FINANCE') && (
                <Button size="xs" colorScheme="blue" onClick={() => handleOpenModal('insurances')}>+ Add Insurance</Button>
              )
            }>
              <Box overflowX="auto">
                <Table size="sm" variant="unstyled">
                  <Thead><Tr borderBottom="1px solid" borderColor="whiteAlpha.100">
                    {['Type','Insurer','Start Date','Expiry Date','Remaining Months','Status','Notes'].map(h => (
                      <Th key={h} color="gray.500" fontSize="10px" py={2}>{h}</Th>
                    ))}
                  </Tr></Thead>
                  <Tbody>
                    {insurances.length === 0 && <Tr><Td colSpan={7}><EmptyState message="No insurance records." /></Td></Tr>}
                    {insurances.map(ins => {
                      const rem = ins.remaining_months ?? 0;
                      const remColor = rem <= 1 ? 'red.400' : rem <= 3 ? 'orange.400' : 'green.400';
                      return (
                        <Tr key={ins.id} borderBottom="1px solid" borderColor="whiteAlpha.50">
                          <Td>
                            <Badge colorScheme={ins.insurance_type === 'PERFORMANCE_BOND' ? 'purple' : ins.insurance_type === 'ADVANCE_GUARANTEE' ? 'blue' : 'teal'} fontSize="9px">
                              {ins.insurance_type?.replace(/_/g, ' ')}
                            </Badge>
                          </Td>
                          <Td><Text fontSize="xs" color="white" fontWeight="600">{ins.insurer || '—'}</Text></Td>
                          <Td><Text fontSize="xs" color="gray.400">{fmtDate(ins.start_date)}</Text></Td>
                          <Td><Text fontSize="xs" color="gray.400">{fmtDate(ins.expiry_date)}</Text></Td>
                          <Td>
                            <Text fontSize="xs" fontWeight="700" color={remColor}>
                              {rem} {rem === 1 ? 'month' : 'months'}
                            </Text>
                          </Td>
                          <Td>
                            <Badge colorScheme={rem <= 1 ? 'red' : rem <= 3 ? 'orange' : 'green'} fontSize="9px">
                              {rem <= 0 ? 'EXPIRED' : rem <= 3 ? 'EXPIRING SOON' : 'ACTIVE'}
                            </Badge>
                          </Td>
                          <Td maxW="180px"><Text fontSize="xs" color="gray.500" noOfLines={2}>{ins.notes || '—'}</Text></Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            </SectionCard>
          </TabPanel>
          {/* ── SLA ──────────────────────────────────────── */}
          <TabPanel p={0}>
            <SectionCard title="Service Level Agreements" actions={
              hasRole('ADMIN', 'PROJECT_MANAGER') && (
                <Button size="xs" colorScheme="blue" onClick={() => nav('/slas')}>Manage SLAs</Button>
              )
            }>
              <Box overflowX="auto">
                <Table size="sm" variant="unstyled">
                  <Thead>
                    <Tr borderBottom="1px solid" borderColor="whiteAlpha.100">
                      <Th color="gray.500" fontSize="10px">SLA Number</Th>
                      <Th color="gray.500" fontSize="10px">Sector</Th>
                      <Th color="gray.500" fontSize="10px">Amount</Th>
                      <Th color="gray.500" fontSize="10px">Dates</Th>
                      <Th color="gray.500" fontSize="10px">Deliverables</Th>
                      <Th color="gray.500" fontSize="10px">Milestones</Th>
                      <Th color="gray.500" fontSize="10px">Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {slas.length === 0 && (
                      <Tr><Td colSpan={7}><EmptyState message="No SLAs found for this project." /></Td></Tr>
                    )}
                    {slas.map(s => {
                      const completedDel = s.deliverables?.filter(d => d.status === 'COMPLETED').length || 0;
                      const completedMil = s.milestones?.filter(m => m.status === 'COMPLETED').length || 0;
                      return (
                        <Tr key={s.id} borderBottom="1px solid" borderColor="whiteAlpha.50" _hover={{ bg: 'whiteAlpha.50' }}>
                          <Td>
                            <Text fontSize="xs" fontWeight="700" color="blue.300" cursor="pointer"
                              _hover={{ textDecoration: 'underline' }} onClick={() => nav(`/slas/${s.id}`)}>
                              {s.sla_number}
                            </Text>
                          </Td>
                          <Td><Badge colorScheme="purple" fontSize="10px">{s.sector}</Badge></Td>
                          <Td><Text fontSize="xs" color="cyan.300" fontWeight="600">{fmtUSD(s.agreement_amount)}</Text></Td>
                          <Td>
                            <Text fontSize="xs" color="gray.400">{fmtDate(s.agreement_date)} →</Text>
                            <Text fontSize="xs" color="gray.400">{fmtDate(s.completion_date)}</Text>
                          </Td>
                          <Td><Text fontSize="xs" color="teal.300">{completedDel} / {s.deliverables?.length || 0}</Text></Td>
                          <Td><Text fontSize="xs" color="orange.300">{completedMil} / {s.milestones?.length || 0}</Text></Td>
                          <Td><Badge colorScheme="gray" fontSize="10px">{s.status || 'Active'}</Badge></Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            </SectionCard>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Dynamic Add Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay bg="blackAlpha.700" />
        <ModalContent bg="gray.900" border="1px solid" borderColor="whiteAlpha.200" color="white">
          <ModalHeader fontSize="md" fontWeight="800">
            {currentModalConfig.title} — {project.project_name}
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit(handleModalSubmit)}>
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {currentModalConfig.fields.map(field => (
                  <FormControl key={field.name} isRequired={field.required} isInvalid={!!errors[field.name]}>
                    <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase">{field.label}</FormLabel>
                    {field.type === 'select' ? (
                      <Select bg="gray.800" defaultValue={field.defaultValue} {...register(field.name, { required: field.required })}>
                        {field.options.map(opt => (
                          <option key={opt} value={opt} style={{ background: '#1a202c' }}>{opt}</option>
                        ))}
                      </Select>
                    ) : field.type === 'checkbox' ? (
                      <Checkbox colorScheme="blue" {...register(field.name)}>
                        <Text fontSize="xs" color="gray.300">Mark as Critical</Text>
                      </Checkbox>
                    ) : field.type === 'textarea' ? (
                      <Textarea bg="gray.800" {...register(field.name, { required: field.required })} />
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
