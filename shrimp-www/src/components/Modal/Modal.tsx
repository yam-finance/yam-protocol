import React from 'react'
import styled from 'styled-components'

import Card from '../Card'
import CardContent from '../CardContent'
import Container from '../Container'

export interface ModalProps {
  onDismiss?: () => void,
}

const Modal: React.FC = ({ children }) => {
  return (
    <Container size="sm">
      <StyledModal>
          <Card>
            <CardContent>
              {children}
            </CardContent>
          </Card>
      </StyledModal>
    </Container>
  )
}

const StyledModal = styled.div`
  border-radius: 12px;
  box-shadow: 24px 24px 48px -24px ${props => props.theme.color.grey[600]};
  position: relative;
`

export default Modal