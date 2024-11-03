import React from "react"
import { useEffect, useState } from "react"
import { Box, Container, Tooltip, Text, Center } from '@chakra-ui/react'
import { TimerContainer } from './TimerContainer'

type TimerProps = {
    createdat: any
    lengthofgame: any
}

export default function Timer(props: TimerProps) {

//Timer Count Down
//console.log("Timer Count Down: ", props)
//console.log("Timer Count Date: ", props.lengthofgame / 86400)
const [createdat, setCreatedat] = useState<string>(new Date(props.createdat * 1000).toISOString())
const [time, setTime] = useState<number>(props.lengthofgame / 86400)
//const [newTime, setNewTime] = useState<number>(0)
const [days, setDays] = useState<number>(0)
const [hours, setHours] = useState<number>(0)
const [minutes, setMinutes] = useState<number>(0)
const [seconds, setSeconds] = useState<number>(0)
const timeToDays = time * 60 * 60 * 24 * 1000
  //console.log("NFDdata: ", data)

  useEffect(() => {
        
        var createddate = new Date(createdat);
        var countDownDate = new Date(createddate).getTime() + timeToDays;

        var updateTime = setInterval(() => {
        var now = new Date().getTime();
        //console.log("Date().getTime()", now1)

        var difference = countDownDate - now;

        var newDays = Math.floor(difference / (1000 * 60 * 60 * 24));
        var newHours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var newMinutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        var newSeconds = Math.floor((difference % (1000 * 60)) / 1000);

        setDays(newDays);
        setHours(newHours);
        setMinutes(newMinutes);
        setSeconds(newSeconds);


        if (difference <= 0) {
            clearInterval(updateTime);
            setDays(0);
            setHours(0);
            setMinutes(0);
            setSeconds(0);
        }
        })

        return () => {
        clearInterval(updateTime);
        }

    }, [time, createdat, timeToDays])

  return (
     <>
    {days == 0 && hours == 0 && minutes == 0 && seconds == 0 ? (
        <Center>
            <Text fontSize='xs' fontWeight='bold' color={'#a2ff44'}>
                Auction Ended
            </Text>
        </Center>
    ) : (
        <TimerContainer
            days={days}
            hours={hours}
            minutes={minutes}
            seconds={seconds}
        />
    )}
    </>
 )
}