import { Box, Icon, Image, useColorModeValue } from '@chakra-ui/react';
import { FaThumbsUp } from "react-icons/fa";
{/*
const Loader = () => (
   <Box
    display="inline-block"
    animation="coinFlip 1.5s infinite"
    transformOrigin="center"
    fontSize="3xl"
  ><svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
    <circle cx="25" cy="25" r="25" fill="#4299e1" />
    <circle cx="25" cy="25" r="20" fill="#FAD02E" />
    </svg>
  </Box> 
);
const Loader2 = () => (
    <Box
      display="inline-block"
      animation="coinFlip 1.5s infinite"
      transformOrigin="center"
      fontSize="80px"
    >
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="200" fill="#FAD02E" />
        <Icon color={'#4299e1'} fontSize='80px' as={FaThumbsUp} />
      </svg>
    </Box>
  );
 const Loader = (props: any) => {
    const colorMode = useColorModeValue('grey.900', '#62cff7');
    return (
      <Box
        display="inline-block"
        animation="coinFlip 1.5s infinite"
        transformOrigin="center"
        fontSize={props.fontSize}
        color={colorMode}
      >
        <Icon as={FaThumbsUp} /> 
      </Box>
    );
  };
  */}
const Loader = (props:any) => {
  const colorMode = useColorModeValue('grey.900', '#62cff7');
  return (
    <Box
      display="inline-block"
      
    >
      <Image src='/loading.gif' /> 
    </Box>
  );
}
export default Loader;
