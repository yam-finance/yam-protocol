import React from 'react'
import styled from 'styled-components'

import Spacer from '../Spacer'

type SeparatorOrientation = 'horizontal' | 'vertical'

interface SeparatorProps {
  orientation?: SeparatorOrientation
}

const Separator: React.FC<SeparatorProps> = ({ orientation }) => {
  return (
    <StyledSeparator orientation={orientation} />
  )
}

interface StyledSeparatorProps {
  orientation?: SeparatorOrientation
}

const StyledSeparator = styled.div<StyledSeparatorProps>`
  background-color: ${props => props.theme.color.grey[100]};
  box-shadow: -1px 0px 0px ${props => props.theme.color.grey[300]}ff;
  height: ${props => props.orientation === 'vertical' ? '100%' : '1px'};
  width: ${props => props.orientation === 'vertical' ? '1px' : '100%'};
`

export default Separator