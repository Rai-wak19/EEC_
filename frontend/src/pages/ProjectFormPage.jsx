import {
  Box, Text, Button, FormControl, FormLabel, Input, Select,
  SimpleGrid, VStack, HStack, FormErrorMessage, useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectService } from '../services/services';
import { PageHeader, SectionCard } from '../components/Layout';
import { LoadingState } from '../components/States';

export default function ProjectFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const nav = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  useEffect(() => {
    if (isEdit) {
      projectService.getById(id)
        .then(data => {
          reset({
            ...data,
            commencement_date: data.commencement_date ? data.commencement_date.substring(0, 10) : '',
            completion_date: data.completion_date ? data.completion_date.substring(0, 10) : '',
            contract_signed_date: data.contract_signed_date ? data.contract_signed_date.substring(0, 10) : '',
            project_manager_name: data.project_manager_name || data.project_manager?.name || '',
          });
          setLoading(false);
        })
        .catch(err => {
          toast({ title: 'Error loading project', description: err.message, status: 'error' });
          nav('/projects');
        });
    }
  }, [id, isEdit, reset, nav, toast]);

  const onSubmit = async (values) => {
    setSaving(true);
    const { project_manager_id, ...payload } = values;
    
    // Convert empty strings to null for date fields
    ['commencement_date', 'completion_date', 'contract_signed_date'].forEach(field => {
      if (payload[field] === '') {
        payload[field] = null;
      }
    });

    try {
      if (isEdit) {
        await projectService.update(id, payload);
        toast({ title: 'Project updated successfully', status: 'success' });
      } else {
        await projectService.create(payload);
        toast({ title: 'Project created successfully', status: 'success' });
      }
      nav('/projects');
    } catch (err) {
      toast({
        title: 'Save Failed',
        description: err?.response?.data?.message || err.message,
        status: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading project details..." />;

  return (
    <Box maxW="1000px" mx="auto">
      <PageHeader
        title={isEdit ? 'Edit Project' : 'Create New Project'}
        subtitle="Manage project portfolio entity details"
        actions={
          <Button variant="ghost" colorScheme="gray" size="sm" onClick={() => nav('/projects')}>
            Cancel
          </Button>
        }
      />

      <SectionCard>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={5} align="stretch">
            {/* Project Type — must be chosen first */}
            <FormControl isRequired isInvalid={!!errors.project_type}>
              <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">
                Project Category
              </FormLabel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                {[
                  { value: 'DESIGN',      label: '🏗️ Design Project',      desc: 'Architectural / Engineering Design',   color: 'blue' },
                  { value: 'SUPERVISION', label: '🔍 Supervision Project',  desc: 'Construction Supervision & Oversight', color: 'teal' },
                  { value: 'DESIGN_REVIEW', label: '📝 Design Review',  desc: 'Review of existing designs', color: 'purple' },
                  { value: 'DESIGN_REVIEW_SUPERVISION', label: '🛠️ Design Review & Supervision',  desc: 'Design review combined with supervision', color: 'orange' },
                ].map(({ value, label, desc, color }) => {
                  const isSelected = watch('project_type') === value;
                  return (
                    <Box
                      key={value}
                      as="button"
                      type="button"
                      onClick={() => setValue('project_type', value, { shouldValidate: true })}
                      border="2px solid"
                      borderColor={isSelected ? `${color}.400` : 'whiteAlpha.200'}
                      borderRadius="lg"
                      p={4}
                      textAlign="left"
                      bg={isSelected ? `${color}.900` : 'gray.800'}
                      _hover={{ borderColor: `${color}.400`, bg: `${color}.900` }}
                      transition="all 0.15s"
                      cursor="pointer"
                    >
                      <Text fontSize="sm" fontWeight="700" color={isSelected ? `${color}.200` : 'white'}>{label}</Text>
                      <Text fontSize="xs" color="gray.400" mt={1}>{desc}</Text>
                    </Box>
                  );
                })}
              </SimpleGrid>
              <input type="hidden" {...register('project_type', { required: 'Please select a project category' })} />
              <FormErrorMessage>{errors.project_type?.message}</FormErrorMessage>
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
              <FormControl isRequired isInvalid={!!errors.project_code}>
                <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">Project Code</FormLabel>
                <Input
                  placeholder="e.g. TSP-015 or IRAMS"
                  bg="gray.800"
                  {...register('project_code', { required: 'Project code is required' })}
                />
                <FormErrorMessage>{errors.project_code?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.project_name}>
                <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">Project Name</FormLabel>
                <Input
                  placeholder="e.g. Coastal Highway Upgrade Phase 1"
                  bg="gray.800"
                  {...register('project_name', { required: 'Project name is required' })}
                />
                <FormErrorMessage>{errors.project_name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">Client</FormLabel>
                <Input placeholder="e.g. Ministry of Roads" bg="gray.800" {...register('client')} />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">Employer</FormLabel>
                <Input placeholder="e.g. Ghana Highway Authority" bg="gray.800" {...register('employer')} />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">Contract Number</FormLabel>
                <Input placeholder="e.g. MOR/2026/089" bg="gray.800" {...register('contract_no')} />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">Consultant</FormLabel>
                <Input placeholder="e.g. EEC Transport" bg="gray.800" defaultValue="EEC Transport" {...register('consultant')} />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">Responsible Team</FormLabel>
                <Input placeholder="e.g. Highways Division A" bg="gray.800" {...register('responsible_team')} />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">Project Manager</FormLabel>
                <Input
                  placeholder="Enter project manager name"
                  bg="gray.800"
                  {...register('project_manager_name')}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">Commencement Date</FormLabel>
                <Input type="date" bg="gray.800" {...register('commencement_date')} />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">Contract Signed Date</FormLabel>
                <Input type="date" bg="gray.800" {...register('contract_signed_date')} />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">Completion Date</FormLabel>
                <Input type="date" bg="gray.800" {...register('completion_date')} />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">Contract Value ($ USD)</FormLabel>
                <Input type="number" step="0.01" placeholder="10000000" bg="gray.800" {...register('contract_value')} />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="0.5px">Project Status</FormLabel>
                <Select bg="gray.800" defaultValue="ACTIVE" {...register('project_status')}>
                  {['ACTIVE', 'COMPLETED', 'SUSPENDED', 'CANCELLED', 'ON_HOLD'].map(s => (
                    <option key={s} value={s} style={{ background: '#1a202c' }}>{s}</option>
                  ))}
                </Select>
              </FormControl>
            </SimpleGrid>

            <HStack justify="flex-end" spacing={3} pt={4}>
              <Button variant="ghost" colorScheme="gray" onClick={() => nav('/projects')}>
                Cancel
              </Button>
              <Button type="submit" colorScheme="blue" isLoading={saving}>
                {isEdit ? 'Save Changes' : 'Create Project'}
              </Button>
            </HStack>
          </VStack>
        </form>
      </SectionCard>
    </Box>
  );
}
