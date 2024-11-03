import { Box, Center, Text, useColorModeValue } from '@chakra-ui/react'

interface numProp {
    num: string | number,
    unit: string,
    flip: boolean,
};

export const NumberBox = ({ num, unit, flip }: numProp) => {
    return (
        <Box p={0}>
            <Text fontSize='sm'>{num}{unit}</Text>
        </Box>
    )
}