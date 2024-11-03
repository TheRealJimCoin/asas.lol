'use strict'

import * as React from 'react'
import { Button, Modal, ModalBody, ModalOverlay, ModalContent, ModalFooter, ModalHeader, ModalCloseButton, HStack } from '@chakra-ui/react';

export const DefaultPopupProps = {
	isOpen: false,
	handleOption: (PopupPermission): void => {}
}

export enum PopupPermission {
    Proceed=1,
    Declined=2,
    Undecided=3
}

export type RequestPopupProps = {
    isOpen: boolean
    handleOption(PopupPermission)
};


export function RequestPopup(props: RequestPopupProps) {

    function handleDecline(){ props.handleOption(PopupPermission.Declined) }
    function handleProceed(){ props.handleOption(PopupPermission.Proceed) }

    return (
            <Modal isOpen={props.isOpen} size={'lg'} onClose={handleDecline}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Please click proceed to allow signing popup</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <HStack>
                            <Button onClick={handleDecline} style={{ margin: "" }}>Nevermind</Button>
                            <Button onClick={handleProceed} style={{ margin: "" }}>Proceed</Button>
                        </HStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={handleDecline}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
    )
}