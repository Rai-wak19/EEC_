import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AppLayout = () => {
  const { isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? '64px' : '240px';
  return (
    <Flex minH="100vh" bg="gray.950">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <Box
        flex={1}
        ml={sidebarWidth}
        transition="margin-left 0.2s ease"
        minH="100vh"
        overflowX="hidden"
      >
        <Box maxW="1600px" mx="auto" p={6}>
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};
