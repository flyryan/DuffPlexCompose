import React from 'react';
import {
  Box,
  Container,
  Flex,
  Heading,
  IconButton,
  useColorMode,
  VStack,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Button,
  ButtonGroup,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import DirectorySetup from './components/DirectorySetup';
import ServiceSelection from './components/ServiceSelection';
import ConfigurationGenerator from './components/ConfigurationGenerator';

const steps = [
  { title: 'Directories', description: 'Configure media paths' },
  { title: 'Services', description: 'Select required services' },
  { title: 'Generate', description: 'Create configuration' },
];

const App: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentStepIndex = () => {
    switch (location.pathname) {
      case '/services':
        return 1;
      case '/generate':
        return 2;
      default:
        return 0;
    }
  };

  const handleNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex === 0) {
      navigate('/services');
    } else if (currentIndex === 1) {
      navigate('/generate');
    }
  };

  const handleBack = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex === 1) {
      navigate('/');
    } else if (currentIndex === 2) {
      navigate('/services');
    }
  };

  return (
    <Box minH="100vh" bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}>
      <Flex
        as="header"
        width="full"
        height="16"
        align="center"
        px={4}
        borderBottom="1px"
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Heading size="md">Media Server Wizard</Heading>
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
            />
          </Flex>
        </Container>
      </Flex>

      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Stepper index={getCurrentStepIndex()} mb={8}>
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>
                <Box flexShrink={0}>
                  <StepTitle>{step.title}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </Box>
                <StepSeparator />
              </Step>
            ))}
          </Stepper>

          <Routes>
            <Route path="/" element={<DirectorySetup />} />
            <Route path="/services" element={<ServiceSelection />} />
            <Route path="/generate" element={<ConfigurationGenerator />} />
          </Routes>

          <ButtonGroup spacing={4} justifyContent="flex-end">
            {getCurrentStepIndex() > 0 && (
              <Button onClick={handleBack} variant="outline">
                Back
              </Button>
            )}
            {getCurrentStepIndex() < 2 && (
              <Button onClick={handleNext} colorScheme="blue">
                Next
              </Button>
            )}
          </ButtonGroup>
        </VStack>
      </Container>
    </Box>
  );
};

export default App;
