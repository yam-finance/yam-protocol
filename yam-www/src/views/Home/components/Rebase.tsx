import React from 'react'
import styled from 'styled-components'

import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Dial from '../../../components/Dial'
import Label from '../../../components/Label'

const Rebase: React.FC = () => {
  return (
    <StyledRebase>
      <Card>
        <CardContent>
          <Dial size={232}>
            <StyledCountdown>
              <StyledCountdownText>
                7:12:15
              </StyledCountdownText>
              <Label text="Next rebase" />
            </StyledCountdown>
          </Dial>
          <StyledSpacer />
          <Button disabled text="Rebase" />
        </CardContent>
      </Card>
    </StyledRebase>
  )
}

const StyledRebase = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const StyledCountdown = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`
const StyledCountdownText = styled.span`
  color: ${props => props.theme.color.grey[600]};
  font-size: 36px;
  font-weight: 700;
`

const StyledSpacer = styled.div`
  height: ${props => props.theme.spacing[4]}px;
`


export default Rebase