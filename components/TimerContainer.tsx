import { NumberBox } from './NumberBox'
import { Box, HStack, Center, Text, useColorModeValue } from '@chakra-ui/react'

interface timeProps{
  days: number | string,
  hours:number | string ,
  minutes:number | string,
  seconds:number | string,
}

export const TimerContainer = ({days, hours, minutes ,seconds }: timeProps) => {

  let daysFlip = false;
  let hoursFlip = false;
  let minutesFlip = false;
  let secondsFlip = true;

 if (seconds <=0 && minutes <=0 && hours <=0 && days <=0){
   daysFlip =  false;
   hoursFlip =  false;
   minutesFlip = false;
   secondsFlip = false;
 }

 if(seconds == 0){
   if( minutes !=0){
    seconds=59;
   }
   
   secondsFlip = false;
   minutesFlip = true;
 }
 if (minutes == 0 ){
    if( hours !=0){
      minutes=59;
    }
   
   minutesFlip = false;
   hoursFlip = true;
 }

 if( hours == 0){
   hoursFlip = false;
   if(days !=0){
     daysFlip = true;
   }
   
 }

   if(days <10){
     days=days
   }

   if(hours <10){
     hours=hours
   }

   if(minutes <10){
     minutes=minutes
   }

   if(seconds < 10){
     seconds="0"+seconds
   }
  
    return (
      <HStack>
        <Text color={'orange.400'} fontWeight='bold' fontSize='10px' p={0}>Ends in</Text>
        <Box p={0}>
          <NumberBox num={days } unit="D" flip={daysFlip} />
        </Box>
        <Box p={0}>
            <NumberBox num={hours } unit="H" flip={hoursFlip} />
        </Box>
        <Box p={0}>
            <NumberBox num={minutes} unit="M" flip={minutesFlip}/>
        </Box>
        <Box p={0}>
            <NumberBox num={seconds} unit="S" flip={secondsFlip} />
        </Box>
      </HStack>
    )
}