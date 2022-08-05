import React from 'react'
import {
  Box,
  Button,
  css,
  Modal as ModalComponent,
  ModalProps as ChakraModalProps,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react'

export interface ModalProps extends ChakraModalProps {
  footer?: {
    actions?: React.ReactNode
    close?: boolean
  }
}

function Modal({
  children,
  isOpen,
  onClose,
  footer,
  ...rest
}: React.PropsWithChildren<ModalProps>) {
  return (
    <ModalComponent
      onClose={onClose}
      isOpen={isOpen}
      size="xl"
      closeOnEsc
      closeOnOverlayClick
      colorScheme="blackAlpha"
      motionPreset="scale"
      orientation="vertical"
      scrollBehavior="inside"
      isCentered
      {...rest}
    >
      <ModalOverlay />
      <ModalContent
        w="full"
        h="full"
        p={5}
        border="4px solid rgba(0, 0, 0, 0.4)"
        borderRadius="8px"
        css={css({
          _hover: { border: '4px solid rgba(0, 0, 0, 0.8)' },
        })}
      >
        <ModalBody margin="auto" pt="15px" overflowX="hidden">
          <Box as="pre" fontSize="small" margin="auto">
            {children}
          </Box>
        </ModalBody>
        <ModalFooter m="25px auto" textAlign="center">
          {footer && (
            <>
              {footer.close ? (
                <React.Fragment>
                  <Button type="button" onClick={onClose}>
                    Close
                  </Button>
                  <span style={{ width: 10 }} />
                </React.Fragment>
              ) : null}
              {footer.actions}
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </ModalComponent>
  )
}

Modal.whyDidYouRender = true

export default React.memo(Modal, (p, np) => p.isOpen === np.isOpen)
