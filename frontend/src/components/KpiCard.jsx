import { Box, Text, Flex, Icon } from '@chakra-ui/react';

export const KpiCard = ({ label, value, subValue, icon, color = 'blue.400', bg = 'whiteAlpha.50', onClick }) => (
  <Box
    bg={bg}
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="xl"
    p={5}
    cursor={onClick ? 'pointer' : 'default'}
    transition="all 0.2s"
    _hover={onClick ? { transform: 'translateY(-2px)', borderColor: color, boxShadow: `0 8px 24px -4px ${color}40` } : {}}
    onClick={onClick}
    minW="160px"
  >
    <Flex justify="space-between" align="flex-start">
      <Box>
        <Text fontSize="xs" color="gray.400" fontWeight="600" textTransform="uppercase" letterSpacing="0.8px" mb={1}>
          {label}
        </Text>
        <Text fontSize="2xl" fontWeight="800" color={color} lineHeight="1">
          {value ?? '—'}
        </Text>
        {subValue && (
          <Text fontSize="xs" color="gray.500" mt={1}>{subValue}</Text>
        )}
      </Box>
      {icon && (
        <Box color={color} opacity={0.7} fontSize="xl">
          {icon}
        </Box>
      )}
    </Flex>
  </Box>
);

export const StatCard = ({ label, value, color = 'white', size = 'md' }) => (
  <Box textAlign="center">
    <Text fontSize={size === 'sm' ? 'xl' : '3xl'} fontWeight="900" color={color}>{value ?? '—'}</Text>
    <Text fontSize={size === 'sm' ? '10px' : 'xs'} color="gray.400" textTransform="uppercase" letterSpacing="0.5px">{label}</Text>
  </Box>
);
