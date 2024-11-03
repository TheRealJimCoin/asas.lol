import { HStack, Wrap, WrapItem, Box, Text, Button } from '@chakra-ui/react';
import { FiDelete } from "react-icons/fi";

const TraitList = ({ traits, onDeleteTrait }) => {
  return (
    <Wrap spacing={2}>
      {traits.map((trait, index) => (
        <WrapItem key={index}>
          <Box borderWidth="1px" p={1} borderRadius="md">
            <HStack align="stretch" spacing={1}>
              <Text fontSize={'xs'}>{trait.name}: {trait.value}</Text>
              <Box _hover={{cursor: 'pointer '}}>
                  <FiDelete onClick={() => onDeleteTrait(index)} color="red" />
              </Box>
            </HStack>
          </Box>
        </WrapItem>
      ))}
    </Wrap>
  );
};

export default TraitList;
