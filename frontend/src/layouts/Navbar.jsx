import { Box, Flex, HStack, Text, IconButton, useDisclosure, Collapse, VStack } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { MdMenu, MdClose } from 'react-icons/md';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  { label: 'Innovation', href: '/innovation' },
  { label: 'Media', href: '/media' },
  { label: 'Contact', href: '/contact' },
  { label: 'English', href: '#' },
];

export const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box bg="gray.900" borderBottom="1px solid" borderColor="whiteAlpha.100">
      <Flex
        h={{ base: "70px", md: "76px" }}
        alignItems="center"
        justifyContent="space-between"
        px={{ base: 4, md: 8 }}
      >
        {/* Logo Section */}
        <Box
          as={NavLink}
          to="/"
          display="flex"
          alignItems="center"
          ml={{ base: 0, md: "30px" }} // ~25-35px left margin
        >
          <Box
            as="img"
            src="/logo.png" // User must upload the transparent PNG here
            alt="EEC - Ethiopian Engineering Corporation"
            w={{ base: "140px", md: "185px" }} // approx 175-190px desktop, 130-150px mobile
            h={{ base: "45px", md: "60px" }}   // approx 55-65px desktop
            objectFit="contain"
          />
        </Box>

        {/* Desktop Navigation */}
        <HStack spacing={8} display={{ base: 'none', lg: 'flex' }}>
          {NAV_ITEMS.map((item) => (
            <Text
              key={item.label}
              as={NavLink}
              to={item.href}
              fontSize="sm"
              fontWeight="500"
              color="gray.300"
              _hover={{ color: 'brand.400', textDecoration: 'none' }}
              style={({ isActive }) => isActive && item.href !== '#' ? { color: '#04acc6', fontWeight: '600' } : {}}
            >
              {item.label}
            </Text>
          ))}
        </HStack>

        {/* Mobile Navigation Toggle */}
        <IconButton
          display={{ base: 'flex', lg: 'none' }}
          onClick={onToggle}
          icon={isOpen ? <MdClose size="24px" /> : <MdMenu size="24px" />}
          variant="ghost"
          color="white"
          aria-label="Toggle Navigation"
        />
      </Flex>

      {/* Mobile Navigation Menu */}
      <Collapse in={isOpen} animateOpacity>
        <VStack
          bg="gray.900"
          p={4}
          display={{ base: 'flex', lg: 'none' }}
          spacing={4}
          align="stretch"
          borderTop="1px solid"
          borderColor="whiteAlpha.100"
        >
          {NAV_ITEMS.map((item) => (
            <Text
              key={item.label}
              as={NavLink}
              to={item.href}
              fontSize="md"
              fontWeight="500"
              color="gray.300"
              onClick={onToggle}
              _hover={{ color: 'brand.400' }}
            >
              {item.label}
            </Text>
          ))}
        </VStack>
      </Collapse>
    </Box>
  );
};
