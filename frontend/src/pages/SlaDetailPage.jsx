import {
  Box, Text, Flex, Tabs, TabList, Tab, TabPanels, TabPanel,
  SimpleGrid, Table, Thead, Tbody, Tr, Th, Td, Badge,
  Button, HStack, VStack, Divider, Stat, StatLabel, StatNumber,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure, FormControl, FormLabel, Input, Select,
  Textarea, FormErrorMessage, useToast, IconButton, Tooltip, Icon,
  Progress,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MdAdd, MdEdit, MdDelete, MdArrowBack } from 'react-icons/md';
import { format, differenceInDays } from 'date-fns';
import { slaService, slaDeliverableService, slaMilestoneService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import { PageHeader, SectionCard } from '../components/Layout';
import { LoadingState, ErrorState, EmptyState } from '../components/States';

const fmtUSD = (v) => v != null ? `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 0 })}` : '—';
const fmtDate = (d) => d ? format(new Date(d), 'dd MMM yyyy') : '—';

const getSlaStatus = (sla) => {
  const comp = new Date(sla.completion_date);
  const now = new Date();
  if (comp < now) return 'Overdue';
  const months = (comp.getFullYear() - now.getFullYear()) * 12 + (comp.getMonth() - now.getMonth());
  if (months <= 3) return 'Expiring Soon';
  return 'Active';
};

const statusColor = { 'Active': 'green', 'Expiring Soon': 'yellow', 'Overdue': 'red', 'Completed': 'blue' };

const DEL_STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED'];
const MIL_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED'];

const delStatusColor = { PLANNED: 'gray', IN_PROGRESS: 'blue', COMPLETED: 'green', DELAYED: 'red', CANCELLED: 'gray' };

function SubItemModal({ isOpen, onClose, onSubmit, title, fields, defaultValues, isSubmitting }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });
  useEffect(() => { if (isOpen) reset(defaultValues); }, [isOpen, defaultValues]);
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg="gray.900" border="1px solid" borderColor="whiteAlpha.200" borderRadius="2xl">
        <ModalHeader color="white" fontSize="md">{title}</ModalHeader>
        <ModalCloseButton color="gray.400" />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <VStack spacing={4}>
              {fields.map(f => (
                <FormControl key={f.name} isInvalid={!!errors[f.name]} isRequired={f.required}>
                  <FormLabel fontSize="sm" color="gray.400">{f.label}</FormLabel>
                  {f.type === 'select' ? (
                    <Select {...register(f.name, f.required ? { required: 'Required' } : {})}
                      bg="gray.800" border="1px solid" borderColor="whiteAlpha.200" color="white">
                      {f.options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                    </Select>
                  ) : f.type === 'textarea' ? (
                    <Textarea {...register(f.name)} bg="gray.800" border="1px solid" borderColor="whiteAlpha.200" color="white" rows={3} />
                  ) : (
                    <Input type={f.type || 'text'} {...register(f.name, f.required ? { required: 'Required' } : {})}
                      bg="gray.800" border="1px solid" borderColor="whiteAlpha.200" color="white"
                      _placeholder={{ color: 'gray.500' }} placeholder={f.placeholder} />
                  )}
                  <FormErrorMessage>{errors[f.name]?.message}</FormErrorMessage>
                </FormControl>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" color="gray.400" onClick={onClose}>Cancel</Button>
            <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>Save</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

export default function SlaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { hasRole } = useAuth();
  const [searchParams] = useSearchParams();

  const [sla, setSla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sub-item modal state
  const { isOpen: isDelOpen, onOpen: onDelOpen, onClose: onDelClose } = useDisclosure();
  const { isOpen: isMilOpen, onOpen: onMilOpen, onClose: onMilClose } = useDisclosure();
  const [editingDel, setEditingDel] = useState(null);
  const [editingMil, setEditingMil] = useState(null);
  const [subIsSubmitting, setSubIsSubmitting] = useState(false);

  const tabMap = { deliverables: 2, milestones: 3 };
  const defaultTab = tabMap[searchParams.get('tab')] || 0;
  const [tabIndex, setTabIndex] = useState(defaultTab);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await slaService.getById(id);
      setSla(data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const canWrite = hasRole('ADMIN', 'TRANSPORT_MANAGER', 'PLANNING_MANAGER', 'PROJECT_MANAGER');

  // ─── Deliverable handlers ───────────────────────────────
  const openAddDel = () => { setEditingDel(null); onDelOpen(); };
  const openEditDel = (d) => { setEditingDel(d); onDelOpen(); };
  const onDelSubmit = async (data) => {
    setSubIsSubmitting(true);
    try {
      if (editingDel) await slaDeliverableService.update(editingDel.id, data);
      else await slaDeliverableService.create({ ...data, sla_id: id });
      toast({ title: editingDel ? 'Deliverable updated.' : 'Deliverable added.', status: 'success', duration: 3000, isClosable: true });
      onDelClose(); load();
    } catch (e) {
      toast({ title: 'Error', description: e?.response?.data?.message || e.message, status: 'error', duration: 5000, isClosable: true });
    } finally { setSubIsSubmitting(false); }
  };
  const onDelDelete = async (delId) => {
    try {
      await slaDeliverableService.remove(delId);
      toast({ title: 'Deliverable deleted.', status: 'success', duration: 3000, isClosable: true });
      load();
    } catch (e) {
      toast({ title: 'Error', description: e?.response?.data?.message || e.message, status: 'error', duration: 5000, isClosable: true });
    }
  };

  // ─── Milestone handlers ─────────────────────────────────
  const openAddMil = () => { setEditingMil(null); onMilOpen(); };
  const openEditMil = (m) => { setEditingMil(m); onMilOpen(); };
  const onMilSubmit = async (data) => {
    setSubIsSubmitting(true);
    try {
      if (editingMil) await slaMilestoneService.update(editingMil.id, data);
      else await slaMilestoneService.create({ ...data, sla_id: id });
      toast({ title: editingMil ? 'Milestone updated.' : 'Milestone added.', status: 'success', duration: 3000, isClosable: true });
      onMilClose(); load();
    } catch (e) {
      toast({ title: 'Error', description: e?.response?.data?.message || e.message, status: 'error', duration: 5000, isClosable: true });
    } finally { setSubIsSubmitting(false); }
  };
  const onMilDelete = async (milId) => {
    try {
      await slaMilestoneService.remove(milId);
      toast({ title: 'Milestone deleted.', status: 'success', duration: 3000, isClosable: true });
      load();
    } catch (e) {
      toast({ title: 'Error', description: e?.response?.data?.message || e.message, status: 'error', duration: 5000, isClosable: true });
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!sla) return null;

  const status = getSlaStatus(sla);
  const deliverables = sla.deliverables || [];
  const milestones = sla.milestones || [];
  const completedDel = deliverables.filter(d => d.status === 'COMPLETED').length;
  const completedMil = milestones.filter(m => m.status === 'COMPLETED').length;
  const delProgress = deliverables.length > 0 ? Math.round((completedDel / deliverables.length) * 100) : 0;
  const milProgress = milestones.length > 0 ? Math.round((completedMil / milestones.length) * 100) : 0;
  const daysLeft = differenceInDays(new Date(sla.completion_date), new Date());

  const delFields = [
    { name: 'name', label: 'Deliverable Name', required: true, placeholder: 'e.g. Final Report' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'percent', label: 'Percentage (%)', type: 'number', placeholder: 'e.g. 25' },
    { name: 'due_date', label: 'Due Date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: DEL_STATUSES },
    { name: 'completion_date', label: 'Completion Date', type: 'date' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ];
  const milFields = [
    { name: 'name', label: 'Milestone Name', required: true, placeholder: 'e.g. Phase 1 Completion' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'due_date', label: 'Due Date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: MIL_STATUSES },
    { name: 'completion_date', label: 'Completion Date', type: 'date' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ];

  return (
    <Box>
      {/* ─── Header ────────────────────────────────────────── */}
      <PageHeader
        title={sla.sla_number}
        subtitle={`${sla.Project?.project_name || ''} • ${sla.sector}`}
        actions={
          <HStack>
            <Button leftIcon={<Icon as={MdArrowBack} />} size="sm" variant="ghost" color="gray.400"
              onClick={() => navigate('/slas')}>
              Back to List
            </Button>
            {canWrite && (
              <Button leftIcon={<Icon as={MdEdit} />} size="sm" colorScheme="blue" variant="outline"
                onClick={() => navigate('/slas')}>
                Edit SLA
              </Button>
            )}
          </HStack>
        }
      />

      {/* ─── Status Banner ────────────────────────────────── */}
      <Flex gap={4} mb={6} wrap="wrap">
        <Badge colorScheme={statusColor[status]} px={3} py={1} fontSize="sm" borderRadius="full">
          {status}
        </Badge>
        <Text fontSize="sm" color="gray.400">
          {daysLeft > 0 ? `${daysLeft} days remaining` : `${Math.abs(daysLeft)} days overdue`}
        </Text>
      </Flex>

      {/* ─── Quick Stats ───────────────────────────────────── */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        {[
          { label: 'Agreement Amount', value: fmtUSD(sla.agreement_amount), color: 'cyan.300' },
          { label: 'Monthly Recognition', value: fmtUSD(sla.monthly_recognition_amount), color: 'green.300' },
          { label: 'Deliverables', value: `${completedDel}/${deliverables.length}`, color: 'teal.300' },
          { label: 'Milestones', value: `${completedMil}/${milestones.length}`, color: 'orange.300' },
        ].map(card => (
          <Box key={card.label} bg="gray.800" borderRadius="xl" p={4} border="1px solid" borderColor="whiteAlpha.100">
            <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="1px" mb={1}>{card.label}</Text>
            <Text fontSize="xl" fontWeight="800" color={card.color}>{card.value}</Text>
          </Box>
        ))}
      </SimpleGrid>

      {/* ─── Tabs ──────────────────────────────────────────── */}
      <Tabs colorScheme="blue" variant="line" index={tabIndex} onChange={setTabIndex}>
        <TabList borderColor="whiteAlpha.100" mb={5} overflowX="auto">
          {['Overview', 'Financial', 'Deliverables', 'Milestones', 'Progress'].map(t => (
            <Tab key={t} fontSize="sm" color="gray.400"
              _selected={{ color: 'blue.300', borderColor: 'blue.400' }} whiteSpace="nowrap">
              {t}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {/* ── Overview ─────────────────────────────────── */}
          <TabPanel p={0}>
            <SectionCard title="Agreement Details">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {[
                  { label: 'SLA Number', value: sla.sla_number },
                  { label: 'Sector', value: sla.sector },
                  { label: 'Project', value: `${sla.Project?.project_code} — ${sla.Project?.project_name}` },
                  { label: 'Client', value: sla.Project?.client || '—' },
                  { label: 'Agreement Date', value: fmtDate(sla.agreement_date) },
                  { label: 'Completion Date', value: fmtDate(sla.completion_date) },
                  { label: 'Status', value: status },
                  { label: 'Days Remaining', value: daysLeft > 0 ? `${daysLeft} days` : `${Math.abs(daysLeft)} days overdue` },
                ].map(item => (
                  <Box key={item.label}>
                    <Text fontSize="10px" color="gray.500" textTransform="uppercase" letterSpacing="1px" mb={1}>{item.label}</Text>
                    <Text fontSize="sm" color="white" fontWeight="500">{item.value}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </SectionCard>
          </TabPanel>

          {/* ── Financial ────────────────────────────────── */}
          <TabPanel p={0}>
            <SectionCard title="Financial Information">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {[
                  { label: 'Agreement Amount', value: fmtUSD(sla.agreement_amount), color: 'cyan.300' },
                  { label: 'Monthly Recognition Amount', value: fmtUSD(sla.monthly_recognition_amount), color: 'green.300' },
                ].map(item => (
                  <Box key={item.label} bg="gray.900" borderRadius="xl" p={5} border="1px solid" borderColor="whiteAlpha.100">
                    <Text fontSize="10px" color="gray.500" textTransform="uppercase" letterSpacing="1px" mb={2}>{item.label}</Text>
                    <Text fontSize="3xl" fontWeight="800" color={item.color}>{item.value}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </SectionCard>
          </TabPanel>

          {/* ── Deliverables ─────────────────────────────── */}
          <TabPanel p={0}>
            <SectionCard title={`Deliverables (${completedDel}/${deliverables.length} completed)`}
              actions={canWrite && (
                <Button size="xs" colorScheme="teal" onClick={openAddDel}>+ Add Deliverable</Button>
              )}>
              {deliverables.length > 0 && (
                <Box mb={4}>
                  <Text fontSize="xs" color="gray.500" mb={1}>Overall Progress — {delProgress}%</Text>
                  <Progress value={delProgress} colorScheme="teal" size="sm" borderRadius="full" />
                </Box>
              )}
              <Box overflowX="auto">
                <Table size="sm" variant="unstyled">
                  <Thead><Tr borderBottom="1px solid" borderColor="whiteAlpha.100">
                    {['Name', 'Due Date', 'Status', '%', 'Amount', 'Completion Date', 'Notes', 'Actions'].map(h => (
                      <Th key={h} color="gray.500" fontSize="10px" py={2}>{h}</Th>
                    ))}
                  </Tr></Thead>
                  <Tbody>
                    {deliverables.length === 0 && <Tr><Td colSpan={6}><EmptyState message="No deliverables added." /></Td></Tr>}
                    {deliverables.map(d => (
                      <Tr key={d.id} borderBottom="1px solid" borderColor="whiteAlpha.50" _hover={{ bg: 'whiteAlpha.50' }}>
                        <Td><Text fontSize="xs" color="white" fontWeight="600">{d.name}</Text>
                          {d.description && <Text fontSize="10px" color="gray.500" noOfLines={1}>{d.description}</Text>}
                        </Td>
                        <Td><Text fontSize="xs" color="gray.400">{fmtDate(d.due_date)}</Text></Td>
                        <Td><Badge colorScheme={delStatusColor[d.status]} fontSize="10px">{d.status?.replace(/_/g, ' ')}</Badge></Td>
                        <Td><Text fontSize="xs" color="gray.300">{d.percent != null ? `${d.percent}%` : '—'}</Text></Td>
                        <Td><Text fontSize="xs" color="white" fontWeight="600">{d.percent != null && sla.agreement_amount != null ? fmtUSD(Number(sla.agreement_amount) * (Number(d.percent) / 100)) : '—'}</Text></Td>
                        <Td><Text fontSize="xs" color="gray.400">{fmtDate(d.completion_date)}</Text></Td>
                        <Td maxW="160px"><Text fontSize="xs" color="gray.500" noOfLines={2}>{d.notes || '—'}</Text></Td>
                        <Td>
                          <HStack spacing={1}>
                            {canWrite && <Tooltip label="Edit" hasArrow><IconButton icon={<Icon as={MdEdit} />} size="xs" variant="ghost" color="gray.400" onClick={() => openEditDel(d)} aria-label="Edit" /></Tooltip>}
                            {hasRole('ADMIN', 'TRANSPORT_MANAGER') && <Tooltip label="Delete" hasArrow><IconButton icon={<Icon as={MdDelete} />} size="xs" variant="ghost" color="red.400" onClick={() => onDelDelete(d.id)} aria-label="Delete" /></Tooltip>}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </SectionCard>
          </TabPanel>

          {/* ── Milestones ───────────────────────────────── */}
          <TabPanel p={0}>
            <SectionCard title={`Milestones (${completedMil}/${milestones.length} completed)`}
              actions={canWrite && (
                <Button size="xs" colorScheme="orange" onClick={openAddMil}>+ Add Milestone</Button>
              )}>
              {milestones.length > 0 && (
                <Box mb={4}>
                  <Text fontSize="xs" color="gray.500" mb={1}>Overall Progress — {milProgress}%</Text>
                  <Progress value={milProgress} colorScheme="orange" size="sm" borderRadius="full" />
                </Box>
              )}
              <Box overflowX="auto">
                <Table size="sm" variant="unstyled">
                  <Thead><Tr borderBottom="1px solid" borderColor="whiteAlpha.100">
                    {['Name', 'Due Date', 'Status', 'Completion Date', 'Notes', 'Actions'].map(h => (
                      <Th key={h} color="gray.500" fontSize="10px" py={2}>{h}</Th>
                    ))}
                  </Tr></Thead>
                  <Tbody>
                    {milestones.length === 0 && <Tr><Td colSpan={6}><EmptyState message="No milestones added." /></Td></Tr>}
                    {milestones.map(m => (
                      <Tr key={m.id} borderBottom="1px solid" borderColor="whiteAlpha.50" _hover={{ bg: 'whiteAlpha.50' }}>
                        <Td><Text fontSize="xs" color="white" fontWeight="600">{m.name}</Text>
                          {m.description && <Text fontSize="10px" color="gray.500" noOfLines={1}>{m.description}</Text>}
                        </Td>
                        <Td><Text fontSize="xs" color="gray.400">{fmtDate(m.due_date)}</Text></Td>
                        <Td><Badge colorScheme={delStatusColor[m.status] || 'gray'} fontSize="10px">{m.status?.replace(/_/g, ' ')}</Badge></Td>
                        <Td><Text fontSize="xs" color="gray.400">{fmtDate(m.completion_date)}</Text></Td>
                        <Td maxW="160px"><Text fontSize="xs" color="gray.500" noOfLines={2}>{m.notes || '—'}</Text></Td>
                        <Td>
                          <HStack spacing={1}>
                            {canWrite && <Tooltip label="Edit" hasArrow><IconButton icon={<Icon as={MdEdit} />} size="xs" variant="ghost" color="gray.400" onClick={() => openEditMil(m)} aria-label="Edit" /></Tooltip>}
                            {hasRole('ADMIN', 'TRANSPORT_MANAGER') && <Tooltip label="Delete" hasArrow><IconButton icon={<Icon as={MdDelete} />} size="xs" variant="ghost" color="red.400" onClick={() => onMilDelete(m.id)} aria-label="Delete" /></Tooltip>}
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </SectionCard>
          </TabPanel>

          {/* ── Progress ─────────────────────────────────── */}
          <TabPanel p={0}>
            <SectionCard title="Completion Progress">
              <VStack spacing={6} align="stretch">
                <Box>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.300" fontWeight="600">Deliverables Progress</Text>
                    <Text fontSize="sm" color="teal.300" fontWeight="700">{delProgress}%</Text>
                  </Flex>
                  <Progress value={delProgress} colorScheme="teal" size="md" borderRadius="full" />
                  <Text fontSize="xs" color="gray.500" mt={1}>{completedDel} of {deliverables.length} deliverables completed</Text>
                </Box>
                <Box>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.300" fontWeight="600">Milestones Progress</Text>
                    <Text fontSize="sm" color="orange.300" fontWeight="700">{milProgress}%</Text>
                  </Flex>
                  <Progress value={milProgress} colorScheme="orange" size="md" borderRadius="full" />
                  <Text fontSize="xs" color="gray.500" mt={1}>{completedMil} of {milestones.length} milestones completed</Text>
                </Box>
                <Divider borderColor="whiteAlpha.100" />
                <SimpleGrid columns={3} spacing={4}>
                  {[
                    { label: 'Days Remaining', value: daysLeft > 0 ? daysLeft : 0, color: daysLeft > 30 ? 'green.300' : daysLeft > 0 ? 'orange.400' : 'red.400' },
                    { label: 'Total Deliverables', value: deliverables.length, color: 'teal.300' },
                    { label: 'Total Milestones', value: milestones.length, color: 'orange.300' },
                  ].map(card => (
                    <Box key={card.label} bg="gray.900" borderRadius="xl" p={4} border="1px solid" borderColor="whiteAlpha.100" textAlign="center">
                      <Text fontSize="2xl" fontWeight="800" color={card.color}>{card.value}</Text>
                      <Text fontSize="11px" color="gray.500">{card.label}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </VStack>
            </SectionCard>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* ─── Deliverable Sub-Modal ─────────────────────────── */}
      <SubItemModal
        isOpen={isDelOpen} onClose={onDelClose}
        onSubmit={onDelSubmit}
        title={editingDel ? 'Edit Deliverable' : 'Add Deliverable'}
        fields={delFields}
        defaultValues={editingDel || { status: 'PLANNED' }}
        isSubmitting={subIsSubmitting}
      />

      {/* ─── Milestone Sub-Modal ───────────────────────────── */}
      <SubItemModal
        isOpen={isMilOpen} onClose={onMilClose}
        onSubmit={onMilSubmit}
        title={editingMil ? 'Edit Milestone' : 'Add Milestone'}
        fields={milFields}
        defaultValues={editingMil || { status: 'NOT_STARTED' }}
        isSubmitting={subIsSubmitting}
      />
    </Box>
  );
}
