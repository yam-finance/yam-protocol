import React from 'react'
import styled from 'styled-components'

export interface IconProps {
  color?: string,
  children?: string
}

const Icon: React.FC = ({ children }) => (
  <StyledIcon>
    {children}
  </StyledIcon>
)

const StyledIcon = styled.div`
`

export default Icon