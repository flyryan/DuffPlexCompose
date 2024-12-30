import React from 'react';
import {
  Box,
  Button,
  Grid,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
  useToast,
  Checkbox,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useWizard } from '../context/WizardContext';
import { useNavigate } from 'react-router-dom';

interface ServiceConfig {
  required: {
    mediaServer: 'plex';
    vpn: 'gluetun';
    downloadClient: 'qbittorrent' | 'transmission';
  };
  optional: {
    movieManager?: 'radarr';
    tvManager?: 'sonarr';
    requestSystem?: 'overseerr' | 'ombi';
  };
  features?: {
    qbtRarSupport?: boolean;
  };
}

const ServiceSelection: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { setServices, services: savedServices } = useWizard();

  const formik = useFormik<ServiceConfig>({
    initialValues: {
      required: {
        mediaServer: savedServices?.required.mediaServer || 'plex',
        vpn: savedServices?.required.vpn || 'gluetun',
        downloadClient: savedServices?.required.downloadClient || 'qbittorrent',
      },
      optional: {
        movieManager: savedServices?.optional.movieManager,
        tvManager: savedServices?.optional.tvManager,
        requestSystem: savedServices?.optional.requestSystem,
      },
      features: {
        qbtRarSupport: savedServices?.features?.qbtRarSupport ?? true,
      },
    },
    validationSchema: Yup.object({
      required: Yup.object({
        mediaServer: Yup.string().oneOf(['plex']).required('Media server is required'),
        vpn: Yup.string().oneOf(['gluetun']).required('VPN gateway is required'),
        downloadClient: Yup.string().oneOf(['qbittorrent', 'transmission']).required('Download client is required'),
      }),
      optional: Yup.object({
        movieManager: Yup.string().oneOf(['radarr']),
        tvManager: Yup.string().oneOf(['sonarr']),
        requestSystem: Yup.string().oneOf(['overseerr', 'ombi']),
      }),
      features: Yup.object({
        qbtRarSupport: Yup.boolean(),
      }),
    }),
    onSubmit: async (values) => {
      try {
        setServices(values);
        toast({
          title: 'Services configured',
          status: 'success',
          duration: 3000,
        });
        navigate('/generate');
      } catch (error) {
        toast({
          title: 'Error configuring services',
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          status: 'error',
          duration: 5000,
        });
      }
    },
  });

  return (
    <Box as="form" onSubmit={formik.handleSubmit}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="md" mb={4}>Required Services</Heading>
          
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
            <Box p={4} borderWidth={1} borderRadius="md">
              <Text fontWeight="bold" mb={2}>Media Server</Text>
              <RadioGroup
                name="required.mediaServer"
                value={formik.values.required.mediaServer}
                onChange={(value) => formik.setFieldValue('required.mediaServer', value)}
              >
                <Stack>
                  <Radio value="plex">Plex</Radio>
                </Stack>
              </RadioGroup>
            </Box>

            <Box p={4} borderWidth={1} borderRadius="md">
              <Text fontWeight="bold" mb={2}>VPN Gateway</Text>
              <RadioGroup
                name="required.vpn"
                value={formik.values.required.vpn}
                onChange={(value) => formik.setFieldValue('required.vpn', value)}
              >
                <Stack>
                  <Radio value="gluetun">Gluetun</Radio>
                </Stack>
              </RadioGroup>
            </Box>

            <Box p={4} borderWidth={1} borderRadius="md">
              <Text fontWeight="bold" mb={2}>Download Client</Text>
              <VStack align="stretch" spacing={4}>
                <RadioGroup
                  name="required.downloadClient"
                  value={formik.values.required.downloadClient}
                  onChange={(value) => formik.setFieldValue('required.downloadClient', value)}
                >
                  <Stack>
                    <Radio value="qbittorrent">qBittorrent</Radio>
                    <Radio value="transmission">Transmission</Radio>
                  </Stack>
                </RadioGroup>

                {formik.values.required.downloadClient === 'qbittorrent' && (
                  <FormControl>
                    <Checkbox
                      isChecked={formik.values.features?.qbtRarSupport}
                      onChange={(e) => formik.setFieldValue('features.qbtRarSupport', e.target.checked)}
                    >
                      Enable automatic RAR extraction
                    </Checkbox>
                  </FormControl>
                )}
              </VStack>
            </Box>
          </Grid>
        </Box>

        <Box>
          <Heading size="md" mb={4}>Optional Services</Heading>
          
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
            <Box p={4} borderWidth={1} borderRadius="md">
              <Text fontWeight="bold" mb={2}>Movie Management</Text>
              <Checkbox
                isChecked={formik.values.optional.movieManager === 'radarr'}
                onChange={(e) => formik.setFieldValue('optional.movieManager', e.target.checked ? 'radarr' : undefined)}
              >
                Radarr
              </Checkbox>
            </Box>

            <Box p={4} borderWidth={1} borderRadius="md">
              <Text fontWeight="bold" mb={2}>TV Show Management</Text>
              <Checkbox
                isChecked={formik.values.optional.tvManager === 'sonarr'}
                onChange={(e) => formik.setFieldValue('optional.tvManager', e.target.checked ? 'sonarr' : undefined)}
              >
                Sonarr
              </Checkbox>
            </Box>

            <Box p={4} borderWidth={1} borderRadius="md">
              <Text fontWeight="bold" mb={2}>Request System</Text>
              <RadioGroup
                name="optional.requestSystem"
                value={formik.values.optional.requestSystem || ''}
                onChange={(value) => formik.setFieldValue('optional.requestSystem', value || undefined)}
              >
                <Stack>
                  <Radio value="overseerr">Overseerr</Radio>
                  <Radio value="ombi">Ombi</Radio>
                </Stack>
              </RadioGroup>
            </Box>
          </Grid>
        </Box>

        <Button
          mt={4}
          colorScheme="blue"
          type="submit"
          isLoading={formik.isSubmitting}
          isDisabled={!formik.isValid}
        >
          Save Service Configuration
        </Button>
      </VStack>
    </Box>
  );
};

export default ServiceSelection;
