import { Badge } from '@chakra-ui/react';

const STATUS_COLORS = {
  GREEN:  'green', YELLOW: 'yellow', RED: 'red', GRAY: 'gray',
  ACTIVE: 'blue', COMPLETED: 'green', SUSPENDED: 'orange', CANCELLED: 'red', ON_HOLD: 'gray',
  OPEN: 'red', MITIGATING: 'orange', CLOSED: 'gray', ESCALATED: 'purple',
  PENDING: 'yellow', IN_PROGRESS: 'blue', OVERDUE: 'red',
  CRITICAL: 'red', HIGH: 'orange', MEDIUM: 'yellow', LOW: 'green',
  NOT_STARTED: 'gray', AT_RISK: 'orange', DELAYED: 'red', IMPROVING: 'blue', ON_TRACK: 'green', FAILED: 'red',
  PLANNED: 'gray', RESOLVED: 'green',
};

export const StatusBadge = ({ status, size = 'sm' }) => (
  <Badge
    colorScheme={STATUS_COLORS[status] || 'gray'}
    borderRadius="full"
    px={3} py={0.5}
    fontSize={size === 'sm' ? '11px' : '13px'}
    fontWeight="700"
    textTransform="uppercase"
    letterSpacing="0.5px"
  >
    {status?.replace(/_/g, ' ')}
  </Badge>
);

export const HealthBadge = ({ status }) => {
  const colors = { GREEN: '#22c55e', YELLOW: '#eab308', RED: '#ef4444', GRAY: '#6b7280' };
  const bg     = colors[status] || '#6b7280';
  return (
    <Badge
      bg={bg} color="white" borderRadius="full" px={3} py={0.5}
      fontSize="11px" fontWeight="800" textTransform="uppercase" letterSpacing="0.7px"
      boxShadow={`0 0 6px ${bg}80`}
    >
      {status === 'GREEN' ? '● ON TRACK' : status === 'YELLOW' ? '▲ AT RISK' : status === 'RED' ? '■ CRITICAL' : '○ N/A'}
    </Badge>
  );
};
