import { Box, Progress, Text, Flex } from '@chakra-ui/react';

const getColor = (value) => {
  if (value >= 80) return 'green';
  if (value >= 50) return 'yellow';
  return 'red';
};

export const ProgressBar = ({ planned, actual, showLabels = true, size = 'sm' }) => {
  const pv = parseFloat(planned) || 0;
  const av = parseFloat(actual)  || 0;
  const color = av >= pv ? 'green' : av >= pv * 0.85 ? 'yellow' : 'red';
  return (
    <Box w="full">
      {showLabels && (
        <Flex justify="space-between" mb={1}>
          <Text fontSize="10px" color="gray.400">Planned {pv.toFixed(1)}%</Text>
          <Text fontSize="10px" color={`${color}.300`} fontWeight="700">Actual {av.toFixed(1)}%</Text>
        </Flex>
      )}
      <Box position="relative">
        <Progress value={pv} size={size} colorScheme="gray" bg="whiteAlpha.100" borderRadius="full" />
        <Box
          position="absolute" top="0" left="0" height="100%"
          width={`${av}%`} bg={`${color}.400`}
          borderRadius="full" transition="width 0.6s ease"
          maxWidth="100%"
        />
      </Box>
    </Box>
  );
};
