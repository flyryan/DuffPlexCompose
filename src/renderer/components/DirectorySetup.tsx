import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  FormHelperText,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useWizard } from '../context/WizardContext';
import { useNavigate } from 'react-router-dom';

interface FormValues {
  media: {
    movies: string;
    tv: string;
    music: string;
  };
  downloads: {
    incomplete: string;
    complete: string;
  };
  backup: string;
  config: string;
}

const DirectorySetup: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { setDirectories } = useWizard();

  const handleBrowse = async (fieldName: string) => {
    try {
      const path = await window.electronAPI.selectDirectory();
      if (path) {
        formik.setFieldValue(fieldName, path);
      }
    } catch (error) {
      toast({
        title: 'Error selecting directory',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const formik = useFormik<FormValues>({
    initialValues: {
      media: {
        movies: '',
        tv: '',
        music: '',
      },
      downloads: {
        incomplete: '',
        complete: '',
      },
      backup: '',
      config: '',
    },
    validationSchema: Yup.object({
      media: Yup.object({
        movies: Yup.string().required('Movies directory is required'),
        tv: Yup.string().required('TV Shows directory is required'),
        music: Yup.string(),
      }),
      downloads: Yup.object({
        incomplete: Yup.string().required('Downloads directory is required'),
        complete: Yup.string().required('Downloads directory is required'),
      }),
      backup: Yup.string().required('Backup directory is required'),
      config: Yup.string().required('Config directory is required'),
    }),
    onSubmit: async (values) => {
      try {
        setDirectories(values);
        toast({
          title: 'Directories configured',
          status: 'success',
          duration: 3000,
        });
        navigate('/services');
      } catch (error) {
        toast({
          title: 'Error configuring directories',
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          status: 'error',
          duration: 5000,
        });
      }
    },
  });

  type NestedKey = 'media.movies' | 'media.tv' | 'media.music' | 'downloads.incomplete' | 'downloads.complete' | 'backup' | 'config';

  const getNestedValue = (obj: any, path: string) => {
    const parts = path.split('.');
    return parts.reduce((acc, part) => (acc ? acc[part] : undefined), obj);
  };

  const renderDirectoryInput = (
    fieldName: NestedKey,
    label: string,
    helperText: string,
    optional: boolean = false,
    placeholder?: string
  ) => {
    const touched = getNestedValue(formik.touched, fieldName);
    const error = getNestedValue(formik.errors, fieldName) as string | undefined;
    const value = getNestedValue(formik.values, fieldName) as string;

    return (
      <FormControl isInvalid={touched && !!error}>
        <FormLabel>{label}{!optional && ' *'}</FormLabel>
        <InputGroup>
          <Input
            name={fieldName}
            value={value}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder={placeholder || `/path/to/${fieldName.split('.').pop()}`}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={() => handleBrowse(fieldName)}>
              Browse
            </Button>
          </InputRightElement>
        </InputGroup>
        <FormHelperText>{helperText}</FormHelperText>
        <FormErrorMessage>
          {error as string}
        </FormErrorMessage>
      </FormControl>
    );
  };

  return (
    <Box as="form" onSubmit={formik.handleSubmit}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="lg" fontWeight="bold">
          Media Directories
        </Text>
        
        {renderDirectoryInput(
          'media.movies',
          'Movies Directory',
          'Directory where movies will be stored'
        )}

        {renderDirectoryInput(
          'media.tv',
          'TV Shows Directory',
          'Directory where TV shows will be stored'
        )}

        {renderDirectoryInput(
          'media.music',
          'Music Directory',
          'Directory where music will be stored',
          true
        )}

        <Text fontSize="lg" fontWeight="bold" mt={4}>
          Download Directories
        </Text>

        {renderDirectoryInput(
          'downloads.incomplete',
          'Incomplete Downloads',
          'Directory for in-progress downloads'
        )}

        {renderDirectoryInput(
          'downloads.complete',
          'Completed Downloads',
          'Directory for completed downloads',
          false,
          '/path/to/downloads'
        )}

        <Text fontSize="lg" fontWeight="bold" mt={4}>
          System Directories
        </Text>

        {renderDirectoryInput(
          'backup',
          'Backup Directory',
          'Directory for configuration backups'
        )}

        {renderDirectoryInput(
          'config',
          'Config Directory',
          'Directory for service configurations'
        )}

        <Button
          mt={4}
          colorScheme="blue"
          type="submit"
          isLoading={formik.isSubmitting}
          isDisabled={!formik.isValid || !formik.dirty}
        >
          Save Directory Configuration
        </Button>
      </VStack>
    </Box>
  );
};

export default DirectorySetup;
