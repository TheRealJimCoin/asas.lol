import React from "react"
import { ReactNode, useRef } from 'react'
import { Box, Icon, Center, Flex, Grid, InputGroup, Text, Spinner, VisuallyHidden, Checkbox, useColorModeValue, Skeleton, HStack, VStack, FormErrorMessage, Link, Tooltip, Image, FormLabel, FormControl, Input, Button } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useForm, UseFormRegisterReturn } from 'react-hook-form'
import { useNavigation } from "../../src/contexts/navigation.context"
import { FiFile } from 'react-icons/fi'
import TraitForm from '../TraitForm'
import TraitList from '../TraitList'

type FileUploadProps = {
    register: UseFormRegisterReturn
    accept?: string
    multiple?: boolean
    children?: ReactNode
  }
  
const FileUpload = (props: FileUploadProps) => {
const { register, accept, multiple, children } = props
const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFileName(files[0].name);
    } else {
      setSelectedFileName(null);
    }
  };
const inputRef = useRef<HTMLInputElement | null>(null)
const { ref, ...rest } = register as {ref: (instance: HTMLInputElement | null) => void}

const handleClick = () => inputRef.current?.click()

return (
    <>
    <InputGroup onClick={handleClick}>
        <input
        type={'file'}
        multiple={multiple || false}
        hidden
        accept={accept}
        {...rest}
        ref={(e) => {
            ref(e)
            inputRef.current = e
        }}
        />
        <>
        {children}
        </>
    </InputGroup>
    {selectedFileName && (
      <Text mt={2} fontSize='xs'>
        Selected file: {selectedFileName}
      </Text>
    )}</>
)
}
interface IRollUpRegistration {
  metatraits: any;
  description: string;
  name: string;
  image: string;
  mimetype: string;
  creator: string;
  file_: FileList;
}

interface IRollUpFormProps {
  onRegistered: (data: IRollUpRegistration) => void;
}


export default function RollUpForm({ onRegistered }: IRollUpFormProps) {
  const {
    handleSubmit, // handels the form submit event
    register, // ties the inputs to react-form
    setValue,
    formState: { errors, isSubmitting }, // gets errors and "loading" state
  } = useForm()
  
  const { walletAssets, loading } = useNavigation()
  //console.log("walletAssets", walletAssets)
  const createButtonColor = useColorModeValue('blue', 'blue')
  const name = register('name', { required: true })
  const description = register('description', { required: true })
  const metatraits = register('metatraits')
  const [traitname, setTraitName] = useState('');
  const [traitvalue, setTraitValue] = useState('');
  const [traits, setTraits] = useState([]);
  //console.log("traits", traits)

  const handleAddTrait = (trait) => {
    setTraits([...traits, trait]);
  };
  const handleDeleteTrait = (index) => {
    setTraits(traits.filter((_, i) => i !== index));
  };

  const validateFiles = (value: FileList) => {
    if (value.length < 1) {
      return 'Files is required'
    }
    for (const file of Array.from(value)) {
      const fsMb = file.size / (1024 * 1024)
      const MAX_FILE_SIZE = 10
      if (fsMb > MAX_FILE_SIZE) {
        return 'Max file size 10mb'
      }
    }
    return true
  }

  const onSubmit = (data: IRollUpRegistration) => {
    // Combine the form data with traits
    const formDataWithTraits = { ...data, metatraits: traits };
    onRegistered(formDataWithTraits);
  };

  return (
    <Center>
    {!loading ? (
          <>
          <Box mt='2'>
            <Center>
              <VStack><Text fontSize='xl'>Loading Wallet Information...</Text><Spinner size='xl'/></VStack>
            </Center>
          </Box>
          </>
        ) : (
          <>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* noValidate will stop the browser validation, so we can write our own designs and logic */}
            <Flex>
            <Box p={1}>
                <FormControl isInvalid={!!errors.file_} isRequired>
                    <FormLabel fontSize='xs'>{'Select Image'}</FormLabel>
                    <FileUpload
                        accept={'image/*'}
                        multiple
                        register={register('file_', { validate: validateFiles })}
                    >
                        <Button size='sm' leftIcon={<Icon as={FiFile} />}>
                        Browse
                        </Button>
                    </FileUpload>
                    <FormErrorMessage>
                        {errors.file_ && errors?.file_.message}
                    </FormErrorMessage>
                </FormControl>
                <FormControl isRequired isInvalid={errors.name}>
                    <FormLabel fontSize='xs' htmlFor="name">{'Name'}</FormLabel>
                    <Input
                    id="name"
                    {...name }
                    size="sm"
                    placeholder="nft name"
                    />
                    <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
                </FormControl>
                <FormControl isRequired isInvalid={errors.description}>
                    <FormLabel fontSize='xs' htmlFor="description">{'Description'}</FormLabel>
                    <Input
                    id="description"
                    {...description }
                    size="sm"
                    placeholder="nft description"
                    />
                    <FormErrorMessage>{errors.description && errors.description.message}</FormErrorMessage>
                </FormControl>
            </Box>
            </Flex>
            <Flex direction="column" mt={4} maxW={'375px'}>
              <Box p={1}>
                <TraitForm onAddTrait={handleAddTrait} />
                <TraitList traits={traits} onDeleteTrait={handleDeleteTrait} />
              </Box>
            </Flex>
            <Center>
            <Button mt={5} colorScheme={createButtonColor} isLoading={isSubmitting} type="submit">
            MINT NFT
            </Button>
            </Center>
            </form>
          </>
        )}
    </Center>
  );
}