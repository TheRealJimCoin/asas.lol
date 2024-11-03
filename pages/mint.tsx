import Head from 'next/head'
import {
    List,
    ListItem,
  Box,
  Button,
  FormControl, 
  FormLabel, 
  Input, 
  Textarea, 
  IconButton,
  VStack, 
  Select,
  Image,
  useMediaQuery,
  useColorModeValue,
  useBreakpointValue,
  useToast
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import React, { useState } from "react"
import Navigation from '../components/Navigation'
import { useNavigation } from "../src/contexts/navigation.context"
import favicon from "../public/favicon.ico"
import { useRouter } from 'next/router'
import Footer from '../components/Footer'

export default function Mint(props) {
  const [ isLargerThan2560 ] = useMediaQuery("(min-width: 2560px)")
  const colSpan = useBreakpointValue({ base: 5, md: 1})
  const bgColorMode = useColorModeValue('gray.400', 'gray.400')
  const { defaultWallet, sessionWallet, tokenList, algoBalance, currency, setCurrency, connected,  updateWallet } = useNavigation()
  const colorText = useColorModeValue('white', 'white')
  const [name, setName] = useState('');
  const [unitName, setUnitName] = useState('');
  const [apiKey,setApiKey] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [nftType, setNftType] = useState('ARC3'); // Default to ARC3
  const [previewUrl, setPreviewUrl] = useState(''); // For storing image preview URL
  const [traits, setTraits] = useState([]);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const router = useRouter()
  const toast = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
        setFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            // Use type assertion to ensure reader.result is treated as a string
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
};
  const handleSubmit = async () => {
    console.log("Minting NFT with: ", { nftType, name, description, file });
    // Mint NFT logic here
  };

  const handleAddTrait = () => {
    if (key && value) {
      const newTraits = [...traits, { [key]: value }];
      setTraits(newTraits);
      setKey('');
      setValue('');
    } else {
      toast({
        title: "Error",
        description: "Both key and value are required",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };
  const handleRemoveTrait = index => {
    const filteredTraits = traits.filter((_, i) => i !== index);
    setTraits(filteredTraits);
  };
  return (
    <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>NFT Marketplace solely using ASAs on Algorand - NFT Buy It Now Listings</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Box p={5} shadow="md" borderWidth="1px" width='80%'>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>NFT Type</FormLabel>
          <Select placeholder="Select NFT type" onChange={(e) => setNftType(e.target.value)} value={nftType}>
   
            <option value="ARC69">ARC69</option>
            <option value="ARC19">ARC19</option>
          </Select>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Pinata API Key</FormLabel>
          <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} type='password' placeholder="Pinata Api Key" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="NFT Name" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Unit Name</FormLabel>
          <Input value={unitName} onChange={(e) => setUnitName(e.target.value)} placeholder="Unit Name" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="NFT Description" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Image</FormLabel>
          <Input type="file" onChange={handleFileChange} accept="image/*" />
          {previewUrl && <Image src={previewUrl} alt="Preview" boxSize="200px" mt={4} />}
     
        </FormControl>
        <Box p={4} borderWidth="1px" borderRadius="lg" overflow="hidden">
      <FormControl mb={4}>
        <FormLabel>Key</FormLabel>
        <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Enter key" />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Value</FormLabel>
        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter value" />
      </FormControl>
      <Button onClick={handleAddTrait} colorScheme="blue" mb={4}>
        Add Trait
      </Button>
      <List spacing={3}>
        {traits.map((trait, index) => (
          <ListItem key={index} display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              {Object.keys(trait)[0]}: {Object.values(trait)[0]}
            </Box>
            <IconButton
              aria-label="Delete trait"
              icon={<DeleteIcon />}
              onClick={() => handleRemoveTrait(index)}
            />
          </ListItem>
        ))}
      </List>
    </Box>
        <Button onClick={handleSubmit} colorScheme="blue">Mint NFT</Button>
      </VStack>
    </Box>
      <Footer />
    </>
  )
}