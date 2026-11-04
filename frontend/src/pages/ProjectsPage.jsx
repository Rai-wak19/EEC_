import {
  Box, Text, Flex, Button, Table, Thead, Tbody, Tr, Th, Td,
  Input, Select, InputGroup, InputLeftElement, HStack,
  IconButton, Tooltip, SimpleGrid, Tag, Badge,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';
import { projectService } from '../services/services';
import { HealthBadge, StatusBadge } from '../components/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '../components/States';
import { PageHeader } from '../components/Layout';
import { ProgressBar } from '../components/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const fmtPct = (v) => v != null ? `${Number(v).toFixed(1)}%` : '—';
const fmtSPI = (v) => v != null ? Number(v).toFixed(2) : '—';
const fmtUSD = (v) => v != null ? `$${(v/1e6).toFixed(2)}M` : '—';

export default function ProjectsPage() {
  const { hasRole } = useAuth();
  const nav = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [healthFilter, setHealthFilter] = useState('');
  const [typeFilter, setTypeFilter]     = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await projectService.getAll({
        search: search || undefined,
        project_status: statusFilter || undefined,
        project_type: typeFilter || undefined
      });
      setProjects(data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally { setLoading(false); }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = healthFilter
    ? projects.filter(p => p.health_status === healthFilter)
    : projects;

  return (
    <Box>
      <PageHeader
        title="Project Portfolio Register"
        subtitle={`${projects.length} projects in portfolio`}
        actions={hasRole('ADMIN', 'MANAGING_DIRECTOR', 'PPM_MANAGER') && (
          <Button leftIcon={<AddIcon />} colorScheme="blue" size="sm" onClick={() => nav('/projects/new')}>
            Add Project
          </Button>
        )}
      />

      {/* Filters */}
      <HStack spacing={3} mb={5} wrap="wrap">
        <InputGroup size="sm" maxW="280px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.500" />
          </InputLeftElement>
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            bg="gray.800" border="1px solid" borderColor="whiteAlpha.200"
            color="white" _placeholder={{ color: 'gray.600' }}
            _focus={{ borderColor: 'blue.400' }}
          />
        </InputGroup>
        <Select
          size="sm" placeholder="All Statuses" maxW="160px"
          bg="gray.800" border="1px solid" borderColor="whiteAlpha.200"
          color="white" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
        >
          {['ACTIVE','COMPLETED','SUSPENDED','CANCELLED','ON_HOLD'].map(s => (
            <option key={s} value={s} style={{ background: '#1a202c' }}>{s}</option>
          ))}
        </Select>
        <Select
          size="sm" placeholder="All Health" maxW="140px"
          bg="gray.800" border="1px solid" borderColor="whiteAlpha.200"
          color="white" value={healthFilter} onChange={e => setHealthFilter(e.target.value)}
        >
          {['GREEN','YELLOW','RED','GRAY'].map(s => (
            <option key={s} value={s} style={{ background: '#1a202c' }}>{s}</option>
          ))}
        </Select>
        <Select
          size="sm" placeholder="All Types" maxW="150px"
          bg="gray.800" border="1px solid" borderColor="whiteAlpha.200"
          color="white" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
        >
          {['DESIGN','SUPERVISION', 'DESIGN_REVIEW', 'DESIGN_REVIEW_SUPERVISION'].map(s => (
            <option key={s} value={s} style={{ background: '#1a202c' }}>
              {s === 'DESIGN_REVIEW_SUPERVISION' ? 'DESIGN AND REVIEW SUPERVISION' : s.replace(/_/g, ' ')}
            </option>
          ))}
        </Select>
        {(search || statusFilter || healthFilter || typeFilter) && (
          <Button size="sm" variant="ghost" colorScheme="gray" onClick={() => { setSearch(''); setStatusFilter(''); setHealthFilter(''); setTypeFilter(''); }}>
            Clear
          </Button>
        )}
      </HStack>

      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <Box
          bg="whiteAlpha.50"
          border="1px solid"
          borderColor="whiteAlpha.100"
          borderRadius="xl"
          overflow="hidden"
        >
          <Box overflowX="auto">
            <Table size="sm" variant="unstyled">
              <Thead>
                <Tr borderBottom="2px solid" borderColor="whiteAlpha.100">
                  {['Code', 'Type', 'Project Name', 'Client', 'Project Manager', 'Contract Signed', 'Start', 'End', 'Value', 'Planned', 'Actual', 'SPI', 'Status', 'Health', ''].map(h => (
                    <Th key={h} color="gray.500" fontSize="10px" fontWeight="700" letterSpacing="0.8px" py={3} px={3}>{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {filtered.length === 0 && (
                  <Tr><Td colSpan={14}><EmptyState message="No projects found." icon="📁" /></Td></Tr>
                )}
                {filtered.sort((a, b) => {
                  const o = { RED: 0, YELLOW: 1, GREEN: 2, GRAY: 3 };
                  return (o[a.health_status] ?? 4) - (o[b.health_status] ?? 4);
                }).map(p => (
                  <Tr
                    key={p.id}
                    cursor="pointer"
                    borderBottom="1px solid"
                    borderColor="whiteAlpha.50"
                    _hover={{ bg: 'whiteAlpha.100' }}
                    onClick={() => nav(`/projects/${p.id}`)}
                    bg={p.health_status === 'RED' ? 'rgba(239,68,68,0.03)' : undefined}
                  >
                    <Td px={3}><Text fontSize="xs" fontWeight="700" color="blue.300">{p.project_code}</Text></Td>
                    <Td px={3}>
                      <Badge size="xs" fontSize="9px" colorScheme={
                        p.project_type === 'DESIGN' ? 'blue' : 
                        p.project_type === 'SUPERVISION' ? 'teal' : 
                        p.project_type === 'DESIGN_REVIEW' ? 'purple' : 'orange'
                      }>
                        {
                          p.project_type === 'DESIGN' ? 'DSGN' : 
                          p.project_type === 'SUPERVISION' ? 'SUPV' : 
                          p.project_type === 'DESIGN_REVIEW' ? 'REVW' : 
                          p.project_type === 'DESIGN_REVIEW_SUPERVISION' ? 'REV_SUPV' : '—'
                        }
                      </Badge>
                    </Td>
                    <Td px={3} maxW="180px"><Tooltip label={p.project_name}><Text fontSize="xs" color="white" fontWeight="500" noOfLines={2}>{p.project_name}</Text></Tooltip></Td>
                    <Td px={3}><Text fontSize="xs" color="gray.400">{p.client}</Text></Td>
                    <Td px={3}><Text fontSize="xs" color="gray.400">{p.project_manager_name || p.project_manager?.name || '—'}</Text></Td>
                    <Td px={3}><Text fontSize="xs" color="purple.300">{p.contract_signed_date ? format(new Date(p.contract_signed_date), 'dd MMM yyyy') : '—'}</Text></Td>
                    <Td px={3}><Text fontSize="xs" color="gray.500">{p.commencement_date ? format(new Date(p.commencement_date), 'MMM yy') : '—'}</Text></Td>
                    <Td px={3}><Text fontSize="xs" color="gray.500">{p.completion_date ? format(new Date(p.completion_date), 'MMM yy') : '—'}</Text></Td>
                    <Td px={3}><Text fontSize="xs" color="cyan.300">{p.contract_value ? `$${(p.contract_value/1e6).toFixed(1)}M` : '—'}</Text></Td>
                    <Td px={3}><Text fontSize="xs" color="gray.300">{fmtPct(p.latest_planned)}</Text></Td>
                    <Td px={3}><Text fontSize="xs" fontWeight="600" color={p.health_status === 'GREEN' ? 'green.300' : p.health_status === 'RED' ? 'red.300' : 'yellow.300'}>{fmtPct(p.latest_actual)}</Text></Td>
                    <Td px={3}><Text fontSize="xs" fontWeight="700" color={p.spi < 0.80 ? 'red.400' : p.spi < 0.95 ? 'yellow.400' : 'green.400'}>{fmtSPI(p.spi)}</Text></Td>
                    <Td px={3}><StatusBadge status={p.project_status} size="xs" /></Td>
                    <Td px={3}><HealthBadge status={p.health_status} /></Td>
                    <Td px={3}>
                      {hasRole('ADMIN', 'MANAGING_DIRECTOR', 'PPM_MANAGER') && (
                        <Button size="xs" variant="ghost" colorScheme="blue"
                          onClick={e => { e.stopPropagation(); nav(`/projects/${p.id}/edit`); }}>
                          Edit
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}
    </Box>
  );
}
