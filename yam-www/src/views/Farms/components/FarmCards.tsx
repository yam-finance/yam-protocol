import React from 'react'
import styled from 'styled-components'

import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import CardIcon from '../../../components/CardIcon'

import useFarms from '../../../hooks/useFarms'

const FarmCards: React.FC = () => {
  const [farms] = useFarms()
  return (
    <StyledCards>
        {farms.map((farm, i) => (
          <React.Fragment key={i}>
            <StyledCardWrapper>
              <Card>
                <CardContent>
                  <StyledContent>
                    <CardIcon>{farm.icon}</CardIcon>
                    <StyledTitle>{farm.name}</StyledTitle>
                    <StyledDetails>
                      <StyledDetail>Deposit {farm.depositToken}</StyledDetail>
                      <StyledDetail>Earn {farm.earnToken}</StyledDetail>
                    </StyledDetails>
                    <Button text="Select" to={`/farms/${farm.id}`} />
                  </StyledContent>
                </CardContent>
              </Card>
            </StyledCardWrapper>
            {i < farms.length - 1 && <StyledSpacer />}
          </React.Fragment>
        ))}
    </StyledCards>
  )
}

const StyledCards = styled.div`
  display: flex;
  width: 900px;
`

const StyledCardWrapper = styled.div`
  flex: 1;
`

const StyledTitle = styled.h4`
  color: ${props => props.theme.color.grey[600]};
  font-size: 24px;
  font-weight: 700;
  margin: ${props => props.theme.spacing[2]}px 0 0;
  padding: 0;
`

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`

const StyledIcon = styled.div`
  font-size: 56px;
  margin-top: ${props => props.theme.spacing[2]}px;
`

const StyledSpacer = styled.div`
  height: ${props => props.theme.spacing[4]}px;
  width: ${props => props.theme.spacing[4]}px;
`

const StyledDetails = styled.div`
  margin-bottom: ${props => props.theme.spacing[6]}px;
  margin-top: ${props => props.theme.spacing[2]}px;
  text-align: center;
`

const StyledDetail = styled.div`
  color: ${props => props.theme.color.grey[500]};
`

export default FarmCards