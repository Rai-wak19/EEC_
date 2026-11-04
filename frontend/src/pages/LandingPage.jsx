import { Box, Heading, Text, Button, Flex } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

export default function LandingPage() {
  return (
    <Flex direction="column" align="center" justify="center" minH="calc(100vh - 76px)" p={8} textAlign="center">
      <Heading size="2xl" mb={4} color="white">Welcome to EEC Transport</Heading>
      <Text fontSize="xl" color="gray.400" mb={8} maxW="2xl">
        Ethiopian Engineering Corporation - Planning & Monitoring Dashboard
      </Text>
      <Button as={NavLink} to="/dashboard" size="lg" colorScheme="brand" px={8}>
        Go to Dashboard
      </Button>
    </Flex>
  );
}
