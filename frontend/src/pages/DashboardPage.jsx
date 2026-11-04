import {
  Box, Text, Grid, GridItem, Flex, HStack, VStack, Divider,
  Table, Thead, Tbody, Tr, Th, Td, Badge, SimpleGrid,
  Stat, StatLabel, StatNumber, StatHelpText, Tooltip,
  Alert, AlertIcon, AlertTitle, AlertDescription, Tag,
} from '@chakra-ui/react';
import { useEffect, useState, useCallback } from 'react';
import {
  RadialBarChart, RadialBar, PieChart, Pie, Cell, Tooltip as ReTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/services';
import { KpiCard } from '../components/KpiCard';
import { HealthBadge, StatusBadge } from '../components/StatusBadge';
import { ProgressBar } from '../components/ProgressBar';
import { LoadingState, ErrorState } from '../components/States';
import { SectionCard } from '../components/Layout';
import { format } from 'date-fns';

const HEALTH_COLORS = { GREEN: '#22c55e', YELLOW: '#eab308', RED: '#ef4444', GRAY: '#6b7280' };
const PRIORITY_COLORS = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e' };

function useDashboard() {
  const [data, setData]     = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [overview, projectStatus, schedule, financial, interventions, recovery, forwardLook, risks] =
        await Promise.all([
          dashboardService.getOverview(),
          dashboardService.getProjectStatus(),
          dashboardService.getScheduleDashboard ? dashboardService.getScheduleDashboard() : dashboardService.getSchedule(),
          dashboardService.getFinancialDashboard ? dashboardService.getFinancialDashboard() : dashboardService.getFinancial(),
          dashboardService.getInterventions(),
          dashboardService.getRecovery(),
          dashboardService.getForwardLook(),
          dashboardService.getRisks(),
        ]);
      setData({ overview, projectStatus, schedule, financial, interventions, recovery, forwardLook, risks });
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}

const fmtPct  = (v) => v != null ? `${Number(v).toFixed(1)}%` : '—';
const fmtSPI  = (v) => v != null ? Number(v).toFixed(2) : '—';
const fmtUSD  = (v) => {
  if (v == null) return '—';
  const num = Number(v);
  return num < 0 ? `-$${(Math.abs(num)/1e6).toFixed(2)}M` : `$${(num/1e6).toFixed(2)}M`;
};
const fmtNum  = (v) => v != null ? String(v) : '—';

export default function DashboardPage() {
  const { data, loading, error, reload } = useDashboard();
  const nav = useNavigate();

  if (loading) return <LoadingState message="Loading Executive Dashboard..." />;
  if (error)   return <ErrorState message={error} onRetry={reload} />;

  const { overview, projectStatus = [], interventions = [], recovery = [], forwardLook = {}, risks = [] } = data;
  if (!overview) return <ErrorState message="Dashboard data unavailable." onRetry={reload} />;

  // ── Chart data ─────────────────────────────────────────────────────────────
  const portfolioPieData = [
    { name: 'GREEN',  value: overview.green  || 0, fill: HEALTH_COLORS.GREEN  },
    { name: 'YELLOW', value: overview.yellow || 0, fill: HEALTH_COLORS.YELLOW },
    { name: 'RED',    value: overview.red    || 0, fill: HEALTH_COLORS.RED    },
  ].filter(d => d.value > 0);

  const spiBarData = [...(projectStatus || [])].map(p => ({
    name: p.project_code,
    SPI: p.spi ? parseFloat(p.spi) : 0,
    fill: p.spi >= 0.95 ? '#22c55e' : p.spi >= 0.80 ? '#eab308' : '#ef4444',
  }));

  const progressBarData = [...(projectStatus || [])].map(p => ({
    name: p.project_code,
    Planned: p.planned_progress ? parseFloat(p.planned_progress) : 0,
    Actual:  p.actual_progress  ? parseFloat(p.actual_progress)  : 0,
  }));

  const criticalInterventions = (interventions || []).filter(i => ['CRITICAL', 'HIGH'].includes(i.priority));
  const redProjects = (projectStatus || []).filter(p => p.health_status === 'RED');
  const yellowProjects = (projectStatus || []).filter(p => p.health_status === 'YELLOW');

  const now = new Date();

  return (
    <Box>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <Box mb={6}>
        <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
          <Box>
            <Text fontSize="xs" color="blue.400" fontWeight="700" textTransform="uppercase" letterSpacing="2px" mb={1}>
              EEC Transport Sector
            </Text>
            <Text fontSize="2xl" fontWeight="900" color="white" letterSpacing="-0.5px">
              Executive Project Dashboard
            </Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="xs" color="gray.500">Reporting Month</Text>
            <Text fontSize="sm" fontWeight="700" color="blue.300">
              {overview.latest_reporting_month ? format(new Date(overview.latest_reporting_month), 'MMMM yyyy') : 'No Data'}
            </Text>
            <Text fontSize="10px" color="gray.600">Last Updated: {format(now, 'dd MMM yyyy HH:mm')}</Text>
          </Box>
        </Flex>
        <Divider mt={4} borderColor="whiteAlpha.100" />
      </Box>

      {/* ── 1. KPI Cards ────────────────────────────────────────────────────── */}
      <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={4} mb={6}>
        <KpiCard label="Active Projects"  value={fmtNum(overview.total_active_projects)} color="blue.300" />
        <KpiCard label="On Track (Green)" value={fmtNum(overview.green)}  color="green.400"  subValue={overview.total_active_projects ? `${((overview.green/overview.total_active_projects)*100).toFixed(0)}% of portfolio` : ''} />
        <KpiCard label="At Risk (Yellow)" value={fmtNum(overview.yellow)} color="yellow.400" />
        <KpiCard label="Critical (Red)"   value={fmtNum(overview.red)}    color="red.400" />
        <KpiCard label="Portfolio Planned"value={fmtPct(overview.overall_planned_progress)} color="gray.300" />
        <KpiCard label="Portfolio Actual" value={fmtPct(overview.overall_actual_progress)}  color={overview.schedule_variance < -5 ? 'red.400' : 'green.400'} subValue={`Variance: ${fmtPct(overview.schedule_variance)}`} />
        <KpiCard label="Average SPI"      value={fmtSPI(overview.avg_spi)} color={overview.avg_spi < 0.80 ? 'red.400' : overview.avg_spi < 0.95 ? 'yellow.400' : 'green.400'} />
        <KpiCard label="Financial Progress" value={fmtPct(overview.overall_financial_progress)} color="cyan.400" />
        <KpiCard label="Outstanding Recv."  value={fmtUSD(overview.total_outstanding_receivables)} color={Number(overview.total_outstanding_receivables) < 0 ? "red.400" : "orange.400"} />
        <KpiCard label="Critical Risks"     value={fmtNum(overview.critical_risks)}        color="red.400" />
        <KpiCard label="Interventions Req." value={fmtNum(overview.interventions_required)} color="orange.400" />
      </SimpleGrid>

      {/* ── 2. Portfolio Status Overview ─────────────────────────────────────── */}
      <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={5} mb={5}>
        {/* Pie chart */}
        <SectionCard title="Portfolio Health">
          <Flex direction="column" align="center" gap={4}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={portfolioPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {portfolioPieData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Pie>
                <ReTooltip formatter={(v, n) => [v, n]} contentStyle={{ background: '#1a202c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <HStack spacing={4} justify="center">
              {[['GREEN', '#22c55e'], ['YELLOW', '#eab308'], ['RED', '#ef4444']].map(([s, c]) => (
                <HStack key={s} spacing={1}>
                  <Box w={3} h={3} bg={c} borderRadius="full" />
                  <Text fontSize="xs" color="gray.400">{s}: {overview[s.toLowerCase()] || 0}</Text>
                </HStack>
              ))}
            </HStack>
          </Flex>
        </SectionCard>

        {/* SPI bar chart */}
        <SectionCard title="SPI by Project">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={spiBarData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <YAxis domain={[0, 1.2]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <ReTooltip contentStyle={{ background: '#1a202c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              {/* reference lines at 0.80 and 0.95 */}
              <Bar dataKey="SPI" radius={[4, 4, 0, 0]}>
                {spiBarData.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </Grid>

      {/* ── 3. Project Status Table ───────────────────────────────────────────── */}
      <SectionCard title="Project Status Register" mb={5}>
        <Box overflowX="auto">
          <Table size="sm" variant="unstyled">
            <Thead>
              <Tr borderBottom="1px solid" borderColor="whiteAlpha.100">
                {['Code', 'Project', 'Client', 'PM', 'Contract Signed', 'Planned', 'Actual', 'Variance', 'SPI', 'Financial', 'Status'].map(h => (
                  <Th key={h} color="gray.500" fontSize="10px" letterSpacing="0.8px" py={3} fontWeight="700">{h}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {projectStatus.sort((a, b) => {
                const order = { RED: 0, YELLOW: 1, GREEN: 2, GRAY: 3 };
                return (order[a.health_status] ?? 4) - (order[b.health_status] ?? 4);
              }).map(p => (
                <Tr
                  key={p.id}
                  cursor="pointer"
                  borderBottom="1px solid"
                  borderColor="whiteAlpha.50"
                  _hover={{ bg: 'whiteAlpha.50' }}
                  onClick={() => nav(`/projects/${p.id}`)}
                  bg={p.health_status === 'RED' ? 'rgba(239,68,68,0.04)' : p.health_status === 'YELLOW' ? 'rgba(234,179,8,0.04)' : undefined}
                >
                  <Td>
                    <Text fontSize="xs" fontWeight="700" color="blue.300">{p.project_code}</Text>
                  </Td>
                  <Td maxW="180px">
                    <Tooltip label={p.project_name}>
                      <Text fontSize="xs" color="white" fontWeight="500" noOfLines={1}>{p.project_name}</Text>
                    </Tooltip>
                  </Td>
                  <Td><Text fontSize="xs" color="gray.400">{p.client}</Text></Td>
                  <Td><Text fontSize="xs" color="gray.400">{p.project_manager_name || p.project_manager?.name || '—'}</Text></Td>
                  <Td><Text fontSize="xs" color="purple.300">{p.contract_signed_date ? format(new Date(p.contract_signed_date), 'dd MMM yyyy') : '—'}</Text></Td>
                  <Td><Text fontSize="xs" color="gray.300">{fmtPct(p.planned_progress)}</Text></Td>
                  <Td><Text fontSize="xs" fontWeight="600" color={p.health_status === 'GREEN' ? 'green.300' : p.health_status === 'RED' ? 'red.300' : 'yellow.300'}>{fmtPct(p.actual_progress)}</Text></Td>
                  <Td><Text fontSize="xs" color={p.schedule_variance < -5 ? 'red.400' : p.schedule_variance < 0 ? 'yellow.400' : 'green.400'}>{p.schedule_variance != null ? `${Number(p.schedule_variance) > 0 ? '+' : ''}${Number(p.schedule_variance).toFixed(1)}%` : '—'}</Text></Td>
                  <Td><Text fontSize="xs" fontWeight="700" color={p.spi < 0.80 ? 'red.400' : p.spi < 0.95 ? 'yellow.400' : 'green.400'}>{fmtSPI(p.spi)}</Text></Td>
                  <Td><Text fontSize="xs" color="cyan.300">{fmtPct(p.financial_progress)}</Text></Td>
                  <Td><HealthBadge status={p.health_status} /></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </SectionCard>

      {/* ── 4. Management Interventions Required ─────────────────────────────── */}
      {criticalInterventions.length > 0 && (
        <Box mb={5}>
          <Flex align="center" gap={3} mb={3}>
            <Box w={1} h={6} bg="red.500" borderRadius="full" />
            <Text fontSize="sm" fontWeight="800" color="red.400" textTransform="uppercase" letterSpacing="1px">
              ⚠ Management Action Required
            </Text>
            <Badge colorScheme="red" borderRadius="full" px={2}>{criticalInterventions.length}</Badge>
          </Flex>
          <VStack spacing={3} align="stretch">
            {criticalInterventions.map(i => (
              <Box
                key={i.id}
                bg={i.priority === 'CRITICAL' ? 'rgba(239,68,68,0.08)' : 'rgba(249,115,22,0.08)'}
                border="1px solid"
                borderColor={i.priority === 'CRITICAL' ? 'red.800' : 'orange.800'}
                borderRadius="xl"
                p={5}
                cursor="pointer"
                _hover={{ borderColor: i.priority === 'CRITICAL' ? 'red.600' : 'orange.600' }}
                onClick={() => nav('/interventions')}
              >
                <Flex align="flex-start" justify="space-between" gap={4} wrap="wrap">
                  <Box flex={1}>
                    <HStack spacing={2} mb={2}>
                      <StatusBadge status={i.priority} />
                      <Text fontSize="xs" color="gray.400">{i.Project?.project_code || i.project_code}</Text>
                      {i.is_overdue && <Badge colorScheme="red" fontSize="9px">OVERDUE</Badge>}
                    </HStack>
                    <Text fontSize="sm" fontWeight="700" color="white" mb={2}>{i.problem}</Text>
                    <Text fontSize="xs" color="gray.400" mb={3}>{i.impact}</Text>
                    <Box bg="whiteAlpha.50" borderRadius="md" p={3} border="1px solid" borderColor="whiteAlpha.100">
                      <Text fontSize="10px" color="gray.500" textTransform="uppercase" letterSpacing="0.8px" mb={1}>Decision Required</Text>
                      <Text fontSize="xs" color="yellow.300" fontWeight="600">{i.required_decision}</Text>
                    </Box>
                  </Box>
                  <Box minW="140px" textAlign="right">
                    <Text fontSize="10px" color="gray.500" mb={1}>Responsible</Text>
                    <Text fontSize="xs" color="white" fontWeight="600" mb={3}>{i.responsible_person}</Text>
                    <Text fontSize="10px" color="gray.500" mb={1}>Deadline</Text>
                    <Text fontSize="xs" color={i.is_overdue ? 'red.400' : 'orange.300'} fontWeight="700">
                      {i.deadline ? format(new Date(i.deadline), 'dd MMM yyyy') : '—'}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>
      )}

      {/* ── 5. Progress vs Plan Chart ─────────────────────────────────────────── */}
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={5} mb={5}>
        <SectionCard title="Planned vs Actual Progress by Project">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={progressBarData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} unit="%" />
              <ReTooltip contentStyle={{ background: '#1a202c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} formatter={(v) => `${v.toFixed(1)}%`} />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 11 }} />
              <Bar dataKey="Planned" fill="#4b5563" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Actual"  fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Recovery Plans */}
        <SectionCard title="Recovery Status">
          <VStack spacing={3} align="stretch">
            {recovery.length === 0 && <Text fontSize="sm" color="gray.500">No active recovery plans.</Text>}
            {recovery.map(r => (
              <Box key={r.id} bg="whiteAlpha.50" borderRadius="lg" p={3} border="1px solid" borderColor="whiteAlpha.100">
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="xs" fontWeight="700" color="white">{r.Project?.project_code}</Text>
                  <StatusBadge status={r.recovery_status} size="xs" />
                </Flex>
                <Box>
                  <Flex justify="space-between" mb={1}>
                    <Text fontSize="10px" color="gray.500">Original Gap</Text>
                    <Text fontSize="10px" color="red.400" fontWeight="600">{r.original_gap}%</Text>
                  </Flex>
                  <Flex justify="space-between" mb={1}>
                    <Text fontSize="10px" color="gray.500">Target Gap</Text>
                    <Text fontSize="10px" color="yellow.400" fontWeight="600">{r.recovery_target_gap}%</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="10px" color="gray.500">Current Gap</Text>
                    <Text fontSize="10px" color="orange.400" fontWeight="600">{r.current_gap}%</Text>
                  </Flex>
                </Box>
              </Box>
            ))}
          </VStack>
        </SectionCard>
      </Grid>

      {/* ── 6. Forward Look ───────────────────────────────────────────────────── */}
      <SectionCard title="Forward Look — Next 30/60/90 Days" mb={5}>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          {[['NEXT_30_DAYS', '30 Days', 'red.400'], ['NEXT_60_DAYS', '60 Days', 'yellow.400'], ['NEXT_90_DAYS', '90 Days', 'blue.400']].map(([period, label, color]) => {
            const items = (forwardLook[period === 'NEXT_30_DAYS' ? 'next_30' : period === 'NEXT_60_DAYS' ? 'next_60' : 'next_90'] || []).slice(0, 5);
            return (
              <Box key={period}>
                <Text fontSize="xs" fontWeight="700" color={color} textTransform="uppercase" letterSpacing="0.8px" mb={3}>
                  Next {label}
                </Text>
                <VStack spacing={2} align="stretch">
                  {items.length === 0 && <Text fontSize="xs" color="gray.600">No items.</Text>}
                  {items.map(i => (
                    <Flex key={i.id} gap={2} align="flex-start">
                      <Box w={2} h={2} bg={color} borderRadius="full" mt={1.5} flexShrink={0} />
                      <Box>
                        <Text fontSize="xs" color="white" lineHeight="1.4">{i.description}</Text>
                        <Text fontSize="10px" color="gray.500">{i.Project?.project_code} · {i.category?.replace(/_/g, ' ')}</Text>
                      </Box>
                    </Flex>
                  ))}
                </VStack>
              </Box>
            );
          })}
        </Grid>
      </SectionCard>

      {/* ── 7. Critical Risks ─────────────────────────────────────────────────── */}
      {risks.filter(r => r.rating >= 6).length > 0 && (
        <SectionCard title={`Critical & High Risks (${risks.filter(r => r.rating >= 6).length})`} mb={5}>
          <Box overflowX="auto">
            <Table size="sm" variant="unstyled">
              <Thead>
                <Tr borderBottom="1px solid" borderColor="whiteAlpha.100">
                  {['Project', 'Risk', 'Probability', 'Impact', 'Score', 'Owner', 'Status'].map(h => (
                    <Th key={h} color="gray.500" fontSize="10px" fontWeight="700" letterSpacing="0.8px" py={2}>{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {risks.filter(r => r.rating >= 6).map(r => (
                  <Tr key={r.id} borderBottom="1px solid" borderColor="whiteAlpha.50" _hover={{ bg: 'whiteAlpha.50' }}>
                    <Td><Text fontSize="xs" color="blue.300">{r.Project?.project_code}</Text></Td>
                    <Td maxW="220px"><Tooltip label={r.description}><Text fontSize="xs" color="white" noOfLines={2}>{r.description}</Text></Tooltip></Td>
                    <Td><StatusBadge status={r.probability} size="xs" /></Td>
                    <Td><StatusBadge status={r.impact}      size="xs" /></Td>
                    <Td>
                      <Badge colorScheme="red" borderRadius="full" px={2} fontWeight="800">{r.rating}</Badge>
                    </Td>
                    <Td><Text fontSize="xs" color="gray.400">{r.responsible_person}</Text></Td>
                    <Td><StatusBadge status={r.status} size="xs" /></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </SectionCard>
      )}
    </Box>
  );
}
