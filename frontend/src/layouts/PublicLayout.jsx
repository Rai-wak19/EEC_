import { Box } from '@chakra-ui/react';
import { Navbar } from './Navbar';
import { Outlet } from 'react-router-dom';

export const PublicLayout = () => {
  return (
    <Box minH="100vh" bg="gray.950">
      <Navbar />
      <Box>
        <Outlet />
      </Box>
    </Box>
  );
};
