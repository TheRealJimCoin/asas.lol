// components/TraitForm.js

import { useState } from 'react';
import { Button, Flex, Input } from '@chakra-ui/react';

const TraitForm = ({ onAddTrait }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  const handleAddTrait = () => {
    if (!name || !value) return;
    onAddTrait({ name, value });
    setName('');
    setValue('');
  };

  return (
    <Flex alignItems="center">
      <Input
        placeholder="Trait Name"
        value={name}
        size="sm"
        onChange={(e) => setName(e.target.value)}
        mr={2}
      />
      <Input
        placeholder="Trait Value"
        value={value}
        size="sm"
        onChange={(e) => setValue(e.target.value)}
        mr={2}
      />
      <Button m={1} p={4} size="xs" colorScheme={'blue'} onClick={handleAddTrait}>Add</Button>
    </Flex>
  );
};

export default TraitForm;
