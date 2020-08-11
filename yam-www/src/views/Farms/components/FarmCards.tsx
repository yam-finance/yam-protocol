import React from 'react'
import styled from 'styled-components'

import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import CardIcon from '../../../components/CardIcon'

import useFarms from '../../../hooks/useFarms'

import { Farm } from '../../../contexts/Farms'

const FarmCards: React.FC = () => {
  const [farms] = useFarms()

  const rows = farms.reduce<Farm[][]>((farmRows, farm) => {
    const newFarmRows = [...farmRows]
    if (newFarmRows[newFarmRows.length - 1].length === 3) {
      newFarmRows.push([farm])
    } else {
      newFarmRows[newFarmRows.length - 1].push(farm)
    }
    return newFarmRows
  }, [[]])

  return (
    <StyledCards>
      {rows.map((farmRow, i) => (
        <StyledRow key={i}>
          {farmRow.map((farm, j) => (
            <React.Fragment key={j}>
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
              {(j === 0 || j === 1) && <StyledSpacer />}
            </React.Fragment>
          ))}
        </StyledRow>
      ))}
    </StyledCards>
  )
}

const StyledCards = styled.div`
  width: 900px;
`

const StyledRow = styled.div`
  display: flex;
  margin-bottom: ${props => props.theme.spacing[4]}px;
`

const StyledCardWrapper = styled.div`
  display: flex;
  width: calc((900px - ${props => props.theme.spacing[4]}px * 2) / 3);
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