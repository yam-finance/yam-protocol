import React from 'react'
import styled from 'styled-components'

const MigrateYamIcon: React.FC = () => (
  <StyledIconWrapper>
    <StyledYamOld>🍠</StyledYamOld>
    <StyledYamNew>🍠</StyledYamNew>
  </StyledIconWrapper>
)

const StyledIconWrapper = styled.div`
  display: flex;
`
const StyledYamOld = styled.span.attrs({
  role: 'img'
})`
  filter: saturate(0.5);
  opacity: 0.5;
`
const StyledYamNew = styled.span.attrs({
  role: 'img'
})`
  margin-left: -16px;
  position: relative;
`

export default MigrateYamIcon