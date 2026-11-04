import { Box, Flex, Text, Spinner } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';

export const LoadingState = ({ message = 'Loading...' }) => (
  <Flex h="200px" align="center" justify="center" direction="column" gap={3}>
    <Spinner size="lg" color="blue.400" thickness="3px" />
    <Text color="gray.400" fontSize="sm">{message}</Text>
  </Flex>
);

export const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
  <Flex h="200px" align="center" justify="center" direction="column" gap={3}>
    <WarningIcon boxSize={8} color="red.400" />
    <Text color="red.300" fontSize="sm">{message}</Text>
    {onRetry && (
      <Box as="button" px={4} py={2} bg="red.700" borderRadius="md" color="white" fontSize="sm" onClick={onRetry} _hover={{ bg: 'red.600' }}>
        Retry
      </Box>
    )}
  </Flex>
);

export const EmptyState = ({ message = 'No records found.', icon = '📭' }) => (
  <Flex h="200px" align="center" justify="center" direction="column" gap={3}>
    <Text fontSize="3xl">{icon}</Text>
    <Text color="gray.500" fontSize="sm">{message}</Text>
  </Flex>
);
