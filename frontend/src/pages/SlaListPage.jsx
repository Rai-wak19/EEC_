import {
  Box, Text, Flex, Table, Thead, Tbody, Tr, Th, Td,
  Button, HStack, VStack, Badge, Input, Select,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure, FormControl, FormLabel, FormErrorMessage,
  Textarea, useToast, IconButton, Tooltip, InputGroup, InputLeftElement,
  Icon, Spinner, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText,
  Divider, NumberInput, NumberInputField,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  MdSearch, MdAdd, MdVisibility, MdEdit, MdDelete,
  MdFilterList, MdArrowUpward, MdArrowDownward,
} from 'react-icons/md';
import { format } from 'date-fns';
import { slaService, projectService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/Layout';
import { LoadingState, ErrorState, EmptyState } from '../components/States';

const SECTORS = ['Building and Urban', 'Surveying', 'Laboratory', 'Water and Energy', 'Construction', 'Geotechnical'];

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

const statusColor = {
  'Active': 'green',
  'Expiring Soon': 'yellow',
  'Overdue': 'red',
  'Completed': 'blue',
};

const statusIcon = {
  'Active': '🟢',
  'Expiring Soon': '🟡',
  'Overdue': '🔴',
  'Completed': '🔵',
};

const SortIcon = ({ field, sortBy, sortDir }) => {
  if (sortBy !== field) return null;
  return <Icon as={sortDir === 'asc' ? MdArrowUpward : MdArrowDownward} boxSize={3} ml={1} />;
};

export default function SlaListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { hasRole } = useAuth();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isDelOpen, onOpen: onDelOpen, onClose: onDelClose } = useDisclosure();

  const [slas, setSlas] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingSla, setEditingSla] = useState(null);

  // Search / filter / sort
  const [search, setSearch] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('agreement_date');
  const [sortDir, setSortDir] = useState('desc');

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm();

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [s, p] = await Promise.all([
        slaService.getAll({}),
        projectService.getAll({}),
      ]);
      setSlas(Array.isArray(s) ? s : []);
      setProjects(Array.isArray(p) ? p : []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let list = slas.map(s => ({ ...s, status: getSlaStatus(s) }));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.sla_number?.toLowerCase().includes(q) ||
        s.sector?.toLowerCase().includes(q) ||
        s.Project?.project_name?.toLowerCase().includes(q) ||
        s.Project?.project_code?.toLowerCase().includes(q)
      );
    }
    if (filterSector) list = list.filter(s => s.sector === filterSector);
    if (filterStatus) list = list.filter(s => s.status === filterStatus);
    list.sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy];
      if (typeof av === 'string') av = av.toLowerCase(), bv = bv?.toLowerCase();
      if (av == null) return 1;
      if (bv == null) return -1;
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return list;
  }, [slas, search, filterSector, filterStatus, sortBy, sortDir]);

  // Stat summary
  const totalValue = slas.reduce((s, x) => s + Number(x.agreement_amount || 0), 0);
  const totalMonthly = slas.reduce((s, x) => s + Number(x.monthly_recognition_amount || 0), 0);
  const statusCounts = slas.reduce((acc, s) => {
    const st = getSlaStatus(s); acc[st] = (acc[st] || 0) + 1; return acc;
  }, {});

  const onOpenAdd = (sla = null) => {
    setEditingSla(sla);
    reset(sla ? {
      sla_number: sla.sla_number,
      project_id: sla.project_id,
      sector: sla.sector,
      agreement_amount: sla.agreement_amount,
      agreement_date: sla.agreement_date,
      completion_date: sla.completion_date,
      monthly_recognition_amount: sla.monthly_recognition_amount,
    } : {});
    onAddOpen();
  };

  const onSubmit = async (data) => {
    try {
      if (editingSla) {
        await slaService.update(editingSla.id, data);
        toast({ title: 'SLA updated.', status: 'success', duration: 3000, isClosable: true });
      } else {
        await slaService.create(data);
        toast({ title: 'SLA created.', status: 'success', duration: 3000, isClosable: true });
      }
      onAddClose();
      load();
    } catch (e) {
      toast({ title: 'Error', description: e?.response?.data?.message || e.message, status: 'error', duration: 5000, isClosable: true });
    }
  };

  const onDeleteClick = (id) => { setDeletingId(id); onDelOpen(); };
  const onDeleteConfirm = async () => {
    try {
      await slaService.remove(deletingId);
      toast({ title: 'SLA deleted.', status: 'success', duration: 3000, isClosable: true });
      onDelClose();
      load();
    } catch (e) {
      toast({ title: 'Error', description: e?.response?.data?.message || e.message, status: 'error', duration: 5000, isClosable: true });
    }
  };

  const canWrite = hasRole('ADMIN', 'TRANSPORT_MANAGER', 'PLANNING_MANAGER', 'PROJECT_MANAGER');

  const SortTh = ({ label, field, ...props }) => (
    <Th
      color="gray.400" fontSize="10px" py={3} cursor="pointer" userSelect="none"
      _hover={{ color: 'white' }} onClick={() => handleSort(field)}
      {...props}
    >
      <Flex align="center">
        {label}
        <SortIcon field={field} sortBy={sortBy} sortDir={sortDir} />
      </Flex>
    </Th>
  );

  return (
    <Box>
      <PageHeader
        title="SLA Management"
        subtitle="Service Level Agreements — overview, status, and financial tracking"
        actions={
          canWrite && (
            <Button
              leftIcon={<Icon as={MdAdd} />}
              colorScheme="blue" size="sm"
              onClick={() => onOpenAdd()}
            >
              + Add SLA
            </Button>
          )
        }
      />

      {/* ─── Summary Cards ─────────────────────────────────── */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        {[
          { label: 'Total SLAs', value: slas.length, helpText: 'All agreements', color: 'blue.300' },
          { label: 'Total Value', value: fmtUSD(totalValue), helpText: 'Combined agreement amounts', color: 'cyan.300' },
          { label: 'Monthly Recognition', value: fmtUSD(totalMonthly), helpText: 'Sum of monthly amounts', color: 'green.300' },
          { label: 'Expiring / Overdue', value: (statusCounts['Expiring Soon'] || 0) + (statusCounts['Overdue'] || 0), helpText: 'Require attention', color: 'orange.400' },
        ].map(card => (
          <Box key={card.label} bg="gray.800" borderRadius="xl" p={4} border="1px solid" borderColor="whiteAlpha.100">
            <Text fontSize="10px" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="1px" mb={1}>{card.label}</Text>
            <Text fontSize="2xl" fontWeight="800" color={card.color}>{card.value}</Text>
            <Text fontSize="11px" color="gray.500" mt={1}>{card.helpText}</Text>
          </Box>
        ))}
      </SimpleGrid>

      {/* ─── Search / Filters ──────────────────────────────── */}
      <Flex gap={3} mb={4} wrap="wrap">
        <InputGroup maxW="320px">
          <InputLeftElement pointerEvents="none">
            <Icon as={MdSearch} color="gray.500" />
          </InputLeftElement>
          <Input
            placeholder="Search by SLA #, sector, project..."
            value={search} onChange={e => setSearch(e.target.value)}
            bg="gray.800" border="1px solid" borderColor="whiteAlpha.200"
            color="white" _placeholder={{ color: 'gray.500' }}
            fontSize="sm"
          />
        </InputGroup>
        <Select
          placeholder="All Sectors" value={filterSector}
          onChange={e => setFilterSector(e.target.value)}
          bg="gray.800" border="1px solid" borderColor="whiteAlpha.200"
          color="white" fontSize="sm" maxW="200px"
        >
          {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select
          placeholder="All Statuses" value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          bg="gray.800" border="1px solid" borderColor="whiteAlpha.200"
          color="white" fontSize="sm" maxW="180px"
        >
          {['Active', 'Expiring Soon', 'Overdue', 'Completed'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        {(search || filterSector || filterStatus) && (
          <Button size="sm" variant="ghost" color="gray.400"
            onClick={() => { setSearch(''); setFilterSector(''); setFilterStatus(''); }}>
            Clear
          </Button>
        )}
      </Flex>

      {/* ─── Table ─────────────────────────────────────────── */}
      <Box bg="gray.800" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden">
        {loading ? (
          <Flex justify="center" p={12}><Spinner color="blue.400" size="xl" /></Flex>
        ) : error ? (
          <Box p={6}><ErrorState message={error} onRetry={load} /></Box>
        ) : (
          <Box overflowX="auto">
            <Table size="sm" variant="unstyled">
              <Thead>
                <Tr borderBottom="1px solid" borderColor="whiteAlpha.100" bg="gray.900">
                  <Th color="gray.500" fontSize="10px" py={3}>#</Th>
                  <SortTh label="SLA / Agreement" field="sla_number" />
                  <SortTh label="Project" field="project_id" />
                  <SortTh label="Sector" field="sector" />
                  <SortTh label="Agreement Amount" field="agreement_amount" isNumeric />
                  <SortTh label="Agreement Date" field="agreement_date" />
                  <SortTh label="Completion Date" field="completion_date" />
                  <SortTh label="Monthly Recognition" field="monthly_recognition_amount" isNumeric />
                  <Th color="gray.400" fontSize="10px" py={3}>Deliverables</Th>
                  <Th color="gray.400" fontSize="10px" py={3}>Milestones</Th>
                  <SortTh label="Status" field="status" />
                  <Th color="gray.400" fontSize="10px" py={3}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.length === 0 && (
                  <Tr><Td colSpan={12}><EmptyState message="No SLAs found." /></Td></Tr>
                )}
                {filtered.map((sla, idx) => {
                  const deliverableCount = sla.deliverables?.length || 0;
                  const milestoneCount = sla.milestones?.length || 0;
                  const completedDel = sla.deliverables?.filter(d => d.status === 'COMPLETED').length || 0;
                  const completedMil = sla.milestones?.filter(m => m.status === 'COMPLETED').length || 0;
                  return (
                    <Tr
                      key={sla.id}
                      borderBottom="1px solid" borderColor="whiteAlpha.50"
                      _hover={{ bg: 'whiteAlpha.50' }}
                    >
                      <Td>
                        <Text fontSize="xs" color="gray.500">{idx + 1}</Text>
                      </Td>
                      <Td>
                        <Text
                          fontSize="sm" fontWeight="700" color="blue.300"
                          cursor="pointer" _hover={{ textDecoration: 'underline' }}
                          onClick={() => navigate(`/slas/${sla.id}`)}
                        >
                          {sla.sla_number}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="xs" color="gray.300" noOfLines={1} maxW="160px">
                          {sla.Project?.project_name || '—'}
                        </Text>
                        <Text fontSize="10px" color="gray.500">{sla.Project?.project_code}</Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="purple" fontSize="10px" textTransform="none">
                          {sla.sector}
                        </Badge>
                      </Td>
                      <Td isNumeric>
                        <Text fontSize="xs" color="cyan.300" fontWeight="600">{fmtUSD(sla.agreement_amount)}</Text>
                      </Td>
                      <Td>
                        <Text fontSize="xs" color="gray.400">{fmtDate(sla.agreement_date)}</Text>
                      </Td>
                      <Td>
                        <Text fontSize="xs" color="gray.400">{fmtDate(sla.completion_date)}</Text>
                      </Td>
                      <Td isNumeric>
                        <Text fontSize="xs" color="green.300" fontWeight="600">{fmtUSD(sla.monthly_recognition_amount)}</Text>
                      </Td>
                      <Td>
                        <Tooltip label={`${completedDel}/${deliverableCount} completed`} hasArrow>
                          <Box
                            cursor="pointer"
                            onClick={() => navigate(`/slas/${sla.id}?tab=deliverables`)}
                          >
                            <Text fontSize="xs" color="teal.300" fontWeight="600" _hover={{ textDecoration: 'underline' }}>
                              {deliverableCount} Deliverable{deliverableCount !== 1 ? 's' : ''}
                            </Text>
                            {deliverableCount > 0 && (
                              <Text fontSize="10px" color="gray.500">{completedDel} done</Text>
                            )}
                          </Box>
                        </Tooltip>
                      </Td>
                      <Td>
                        <Tooltip label={`${completedMil}/${milestoneCount} completed`} hasArrow>
                          <Box
                            cursor="pointer"
                            onClick={() => navigate(`/slas/${sla.id}?tab=milestones`)}
                          >
                            <Text fontSize="xs" color="orange.300" fontWeight="600" _hover={{ textDecoration: 'underline' }}>
                              {milestoneCount} Milestone{milestoneCount !== 1 ? 's' : ''}
                            </Text>
                            {milestoneCount > 0 && (
                              <Text fontSize="10px" color="gray.500">{completedMil} done</Text>
                            )}
                          </Box>
                        </Tooltip>
                      </Td>
                      <Td>
                        <Badge colorScheme={statusColor[sla.status]} fontSize="10px">
                          {statusIcon[sla.status]} {sla.status}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <Tooltip label="View" hasArrow>
                            <IconButton icon={<Icon as={MdVisibility} />} size="xs" variant="ghost"
                              color="blue.400" onClick={() => navigate(`/slas/${sla.id}`)} aria-label="View" />
                          </Tooltip>
                          {canWrite && (
                            <Tooltip label="Edit" hasArrow>
                              <IconButton icon={<Icon as={MdEdit} />} size="xs" variant="ghost"
                                color="gray.400" onClick={() => onOpenAdd(sla)} aria-label="Edit" />
                            </Tooltip>
                          )}
                          {hasRole('ADMIN', 'TRANSPORT_MANAGER') && (
                            <Tooltip label="Delete" hasArrow>
                              <IconButton icon={<Icon as={MdDelete} />} size="xs" variant="ghost"
                                color="red.400" onClick={() => onDeleteClick(sla.id)} aria-label="Delete" />
                            </Tooltip>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        )}
        <Flex justify="space-between" align="center" px={4} py={2} borderTop="1px solid" borderColor="whiteAlpha.100">
          <Text fontSize="xs" color="gray.500">
            Showing {filtered.length} of {slas.length} SLAs
          </Text>
        </Flex>
      </Box>

      {/* ─── Add / Edit Modal ──────────────────────────────── */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="gray.900" border="1px solid" borderColor="whiteAlpha.200" borderRadius="2xl">
          <ModalHeader color="white" fontSize="lg">
            {editingSla ? `Edit ${editingSla.sla_number}` : 'Add New SLA'}
          </ModalHeader>
          <ModalCloseButton color="gray.400" />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <VStack spacing={4}>
                <SimpleGrid columns={2} spacing={4} w="100%">
                  <FormControl isInvalid={!!errors.sla_number} isRequired>
                    <FormLabel fontSize="sm" color="gray.400">SLA / Agreement Number</FormLabel>
                    <Input
                      {...register('sla_number', { required: 'Required' })}
                      placeholder="e.g. SLA-001"
                      bg="gray.800" border="1px solid" borderColor="whiteAlpha.200"
                      color="white" _placeholder={{ color: 'gray.500' }}
                    />
                    <FormErrorMessage>{errors.sla_number?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.project_id} isRequired>
                    <FormLabel fontSize="sm" color="gray.400">Project</FormLabel>
                    <Select
                      {...register('project_id', { required: 'Required' })}
                      bg="gray.800" border="1px solid" borderColor="whiteAlpha.200" color="white"
                    >
                      <option value="">— Select Project —</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.project_code} — {p.project_name}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.project_id?.message}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>

                <FormControl isInvalid={!!errors.sector} isRequired>
                  <FormLabel fontSize="sm" color="gray.400">Sector</FormLabel>
                  <Select
                    {...register('sector', { required: 'Required' })}
                    bg="gray.800" border="1px solid" borderColor="whiteAlpha.200" color="white"
                  >
                    <option value="">— Select Sector —</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                  <FormErrorMessage>{errors.sector?.message}</FormErrorMessage>
                </FormControl>

                <SimpleGrid columns={2} spacing={4} w="100%">
                  <FormControl isInvalid={!!errors.agreement_amount} isRequired>
                    <FormLabel fontSize="sm" color="gray.400">Agreement Amount</FormLabel>
                    <Input
                      type="number" step="0.01"
                      {...register('agreement_amount', { required: 'Required', min: { value: 0, message: 'Must be positive' } })}
                      placeholder="e.g. 5000000"
                      bg="gray.800" border="1px solid" borderColor="whiteAlpha.200"
                      color="white" _placeholder={{ color: 'gray.500' }}
                    />
                    <FormErrorMessage>{errors.agreement_amount?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.monthly_recognition_amount} isRequired>
                    <FormLabel fontSize="sm" color="gray.400">Monthly Recognition Amount</FormLabel>
                    <Input
                      type="number" step="0.01"
                      {...register('monthly_recognition_amount', { required: 'Required', min: { value: 0, message: 'Must be positive' } })}
                      placeholder="e.g. 400000"
                      bg="gray.800" border="1px solid" borderColor="whiteAlpha.200"
                      color="white" _placeholder={{ color: 'gray.500' }}
                    />
                    <FormErrorMessage>{errors.monthly_recognition_amount?.message}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={2} spacing={4} w="100%">
                  <FormControl isInvalid={!!errors.agreement_date} isRequired>
                    <FormLabel fontSize="sm" color="gray.400">Agreement Date</FormLabel>
                    <Input
                      type="date"
                      {...register('agreement_date', { required: 'Required' })}
                      bg="gray.800" border="1px solid" borderColor="whiteAlpha.200" color="white"
                    />
                    <FormErrorMessage>{errors.agreement_date?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors.completion_date} isRequired>
                    <FormLabel fontSize="sm" color="gray.400">Completion Date</FormLabel>
                    <Input
                      type="date"
                      {...register('completion_date', { required: 'Required' })}
                      bg="gray.800" border="1px solid" borderColor="whiteAlpha.200" color="white"
                    />
                    <FormErrorMessage>{errors.completion_date?.message}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </ModalBody>
            <ModalFooter gap={3}>
              <Button variant="ghost" color="gray.400" onClick={onAddClose}>Cancel</Button>
              <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
                {editingSla ? 'Update SLA' : 'Create SLA'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* ─── Delete Confirm Modal ──────────────────────────── */}
      <Modal isOpen={isDelOpen} onClose={onDelClose} size="sm">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg="gray.900" border="1px solid" borderColor="red.800" borderRadius="2xl">
          <ModalHeader color="red.400" fontSize="md">Delete SLA</ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody>
            <Text fontSize="sm" color="gray.300">
              Are you sure you want to delete this SLA? This will also remove all associated deliverables and milestones. This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" color="gray.400" onClick={onDelClose}>Cancel</Button>
            <Button colorScheme="red" onClick={onDeleteConfirm}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
