import {
  Box, Flex, Text, Input, Button, FormControl, FormLabel,
  FormErrorMessage, Alert, AlertIcon, VStack
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const [error, setError] = useState('');
  const location = useLocation();
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data) => {
    setError('');
    try {
      await login(data);
      const from = location.state?.from?.pathname || '/dashboard';
      nav(from);
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };


  return (
    <Flex minH="100vh" bg="gray.950" align="center" justify="center" p={4}>
      {/* Background gradient */}
      <Box position="fixed" inset={0} bgGradient="radial(ellipse at 20% 50%, blue.900 0%, transparent 50%), radial(ellipse at 80% 20%, purple.900 0%, transparent 40%)" opacity={0.5} pointerEvents="none" />

      <Box
        bg="gray.900"
        border="1px solid"
        borderColor="whiteAlpha.200"
        borderRadius="2xl"
        p={10}
        w="full"
        maxW="420px"
        boxShadow="0 25px 50px -12px rgba(0,0,0,0.8)"
        position="relative"
      >
        {/* Logo */}
        <VStack spacing={1} mb={8} textAlign="center">
          <Box
            as="img"
            src="/logo.png"
            alt="EEC Logo"
            w="200px"
            h="auto"
            mb={4}
            objectFit="contain"
            mx="auto"
          />
          <Text fontSize="lg" fontWeight="800" color="white" letterSpacing="-0.5px">
            EEC Transport Sector
          </Text>
          <Text fontSize="sm" color="gray.400">
            Planning & Monitoring System
          </Text>
        </VStack>

        {error && (
          <Alert status="error" mb={5} borderRadius="lg" bg="red.900" border="1px solid" borderColor="red.700">
            <AlertIcon color="red.300" />
            <Text fontSize="sm" color="red.200">{error}</Text>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel fontSize="sm" color="gray.300" fontWeight="600">Email Address</FormLabel>
              <Input
                id="email-input"
                type="email"
                placeholder="you@eec.com"
                bg="gray.800"
                border="1px solid"
                borderColor="whiteAlpha.200"
                color="white"
                _hover={{ borderColor: 'blue.500' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #60a5fa' }}
                _placeholder={{ color: 'gray.600' }}
                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Enter a valid email' } })}
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel fontSize="sm" color="gray.300" fontWeight="600">Password</FormLabel>
              <Input
                id="password-input"
                type="password"
                placeholder="••••••••"
                bg="gray.800"
                border="1px solid"
                borderColor="whiteAlpha.200"
                color="white"
                _hover={{ borderColor: 'blue.500' }}
                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #60a5fa' }}
                _placeholder={{ color: 'gray.600' }}
                {...register('password', { required: 'Password is required', minLength: { value: 4, message: 'Min 4 characters' } })}
              />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              w="full"
              colorScheme="blue"
              size="lg"
              isLoading={loading}
              loadingText="Signing In..."
              mt={2}
              fontWeight="700"
              letterSpacing="0.5px"
              boxShadow="0 4px 14px rgba(59,130,246,0.4)"
              _hover={{ boxShadow: '0 6px 20px rgba(59,130,246,0.6)', transform: 'translateY(-1px)' }}
              transition="all 0.2s"
            >
              Sign In
            </Button>
          </VStack>
        </form>
      </Box>
    </Flex>
  );
}
