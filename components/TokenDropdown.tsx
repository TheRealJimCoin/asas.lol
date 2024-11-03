import React, { useState } from "react"
import {
  Input,
  Box,
  Text,
  Flex,
  Image,
  HStack,
  VStack,
  Spacer,
  Center,
  Popover,
  Progress,
  PopoverTrigger,
  PopoverContent,
  InputGroup,
  useMediaQuery,
  useColorModeValue,
  InputRightElement
} from "@chakra-ui/react"
import { ArrowUpDownIcon } from "@chakra-ui/icons"
import InfiniteScroll from 'react-infinite-scroll-component'

function TokenDropdown({ text, onChange, options, algoBalance, hasTokenNextPage, fetchTokenNextPage }) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const scrollBarColor = useColorModeValue('rgba(0, 0, 0, 0.15)', 'rgba(255, 255, 255, 0.15)')
  const [ isLargerThan2560 ] = useMediaQuery("(min-width: 2560px)")

  function selectOption(value) {
    onChange(value)
    setPopoverOpen(false)
  }
  console.log("options", options)
  return (
    <Box w={"full"} pl={1} pr={1}>
      <Popover isOpen={popoverOpen} autoFocus={false} matchWidth>
        <PopoverTrigger>
          <InputGroup>
            <Input
              type={"text"}
              value={text}
              readOnly
              autoComplete="off"
              onClick={() => {popoverOpen ? (setPopoverOpen(false)) : (setPopoverOpen(true))}}
              color={"white"}
              isRequired={true}
            />
            <InputRightElement>
              <ArrowUpDownIcon
                boxSize={"4"}
                color={"white"}
                _hover={{ cursor: "pointer", boxSize: "19px" }}
                onClick={() => {popoverOpen ? (setPopoverOpen(false)) : (setPopoverOpen(true))}}
              />
            </InputRightElement>
          </InputGroup>
        </PopoverTrigger>
        <PopoverContent w={"100%"}>
          <Box py={1} px={1} id="scrollableDiv" overflowY="auto" maxHeight="300px" sx={{
    '&::-webkit-scrollbar': {
      width: '11px',
      borderRadius: '8px',
      backgroundColor: scrollBarColor,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: scrollBarColor,
    },
  }}>
              <Flex
                _hover={{ bgColor: "gray.50", textColor: "black", cursor: "pointer" }}
                my={1}
                borderRadius={"md"}
                bgColor={text === "ALGO" ? "#4299e1" : "#f1f1f1"}
                textColor={text === "ALGO" ? "white" : "black"}
                onClick={() => selectOption({creator: "", asset_id: 0, decimal: 6, unitname:"ALGO", rate:"1"})}
                pl={2}
                pr={2}>
                <Box p='1'>
                  <HStack>
                  <Image boxSize='25px' objectFit='cover' borderRadius='lg' alt='Algorand' src={'/currencies/algo.png'} />
                  <Text
                    fontStyle={"revert"}
                    fontWeight={"hairline"}
                    _hover={{ fontWeight: "normal" }}
                  >
                    ALGO
                  </Text>
                  </HStack>
                </Box>
                <Spacer />
                <Box p='0'>
                  <VStack>
                    <Text fontSize='xs' color={'gray.300'}>BALANCE</Text> 
                    <Text fontSize='xs' mt={0}>{(algoBalance)? (algoBalance / Math.pow(10, 6)).toFixed(2) : 'loading...'}</Text>
                  </VStack>
                </Box>
              </Flex>
              <InfiniteScroll
                dataLength={options.length}
                next={fetchTokenNextPage}
                initialScrollY={0}
                hasMore={(options.length >= 6)? hasTokenNextPage: false}
                loader={(isLargerThan2560 && options.length === 6)? (<Center><Text>Looks like your on a larger screen. Pull down to load more</Text></Center>) : (<Center><Box w='40%' p={2}><Progress size='sm' isIndeterminate /></Box></Center>) }
                scrollableTarget="scrollableDiv"
                // below props only if you need pull down functionality
                refreshFunction={fetchTokenNextPage}
                pullDownToRefresh={(isLargerThan2560 && options.length === 6)? true: false}
                pullDownToRefreshThreshold={50}
                pullDownToRefreshContent={
                  <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
                }
                releaseToRefreshContent={
                  <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
                }
              >
            {options.map((value, i) => (
              <Flex
                key={i}
                _hover={{ bgColor: "gray.50", textColor: "black", cursor: "pointer" }}
                my={1}
                borderRadius={"md"}
                bgColor={text === value.unitname ? "#4299e1" : "#f1f1f1"}
                textColor={text === value.unitname ? "white" : "black"}
                onClick={() => selectOption({creator: value.creator, asset_id:value.asset_id, decimal:value.decimal, unitname:value.unitname, rate:value.rate})}
                pl={2}
                pr={2}>
                <Box p='1'>
                  <HStack>
                  {value.asset_id == 1182124973 || value.asset_id == 1182123607 || value.asset_id == 1691271561 || value.asset_id ==1091143717 || value.asset_id == 1261952433 || value.asset_id == 1265975021 || value.asset_id == 1194470385 || value.asset_id == 1233471765 || value.asset_id == 2200421096 || value.asset_id == 2200403278 ? (
                    <Image boxSize='25px' objectFit='cover' borderRadius='lg' alt={value.unitname} src={'/currencies/'+value.asset_id+'.png'} />
                  ) : (
                    <Image boxSize='25px' objectFit='cover' borderRadius='lg' alt={value.unitname} src={value && value?.image != null ? value.image : 'https://asa-list.tinyman.org/assets/'+value.asset_id+'/icon.png'} />
                  )}
                  <Text
                    fontStyle={"revert"}
                    fontWeight={"hairline"}
                    _hover={{ fontWeight: "normal" }}
                  >
                    {value.unitname}
                  </Text>
                  </HStack>
                </Box>
                <Spacer />
                <Box p='0'>
                  <VStack>
                    <Text fontSize='xs' color={'gray.300'}>BALANCE</Text> 
                    <Text fontSize='xs' mt={0}>{(value.balance / Math.pow(10, value.decimal)).toLocaleString()}</Text> 
                  </VStack>
                </Box>
              </Flex>
            ))}
            </InfiniteScroll>
          </Box>
        </PopoverContent>
      </Popover>
    </Box>
  );
}

export default TokenDropdown;
