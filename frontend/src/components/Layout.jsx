import { Box, Flex, Text, HStack, Divider } from '@chakra-ui/react';

export const PageHeader = ({ title, subtitle, actions }) => (
  <Box mb={6}>
    <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
      <Box>
        <Text fontSize="2xl" fontWeight="800" color="white" letterSpacing="-0.5px">{title}</Text>
        {subtitle && <Text fontSize="sm" color="gray.400" mt={0.5}>{subtitle}</Text>}
      </Box>
      {actions && <HStack gap={3}>{actions}</HStack>}
    </Flex>
    <Divider mt={4} borderColor="whiteAlpha.100" />
  </Box>
);

export const SectionCard = ({ title, children, actions, headerBg }) => (
  <Box
    bg="whiteAlpha.50"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="xl"
    overflow="hidden"
  >
    {title && (
      <Flex
        align="center" justify="space-between" px={5} py={3}
        bg={headerBg || 'whiteAlpha.50'}
        borderBottom="1px solid" borderColor="whiteAlpha.100"
      >
        <Text fontWeight="700" fontSize="sm" color="gray.200" textTransform="uppercase" letterSpacing="0.7px">
          {title}
        </Text>
        {actions}
      </Flex>
    )}
    <Box p={5}>{children}</Box>
  </Box>
);
