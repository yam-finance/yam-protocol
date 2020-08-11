import React from 'react'
import styled from 'styled-components'

import Button from '../Button'
import Input from '../Input'

interface TokenInputProps {
  max: number | string,
  symbol: string,
}

const TokenInput: React.FC<TokenInputProps> = ({
  max,
  symbol,
}) => {
  return (
    <StyledTokenInput>
      <StyledMaxText>{max.toLocaleString()} {symbol} Available</StyledMaxText>
      <Input
        endAdornment={(
          <StyledTokenAdornmentWrapper>
            <StyledTokenSymbol>{symbol}</StyledTokenSymbol>
            <StyledSpacer />
            <div>
              <Button size="sm" text="Max" />
            </div>
          </StyledTokenAdornmentWrapper>
        )}
        placeholder="0"
      />
    </StyledTokenInput>
  )
}

const StyledTokenInput = styled.div`

`

const StyledSpacer = styled.div`
  width: ${props => props.theme.spacing[3]}px;
`

const StyledTokenAdornmentWrapper = styled.div`
  align-items: center;
  display: flex;
`

const StyledMaxText = styled.div`
  align-items: center;
  color: ${props => props.theme.color.grey[400]};
  display: flex;
  font-size: 14px;
  font-weight: 700;
  height: 44px;
  justify-content: flex-end;
`

const StyledTokenSymbol = styled.span`
  color: ${props => props.theme.color.grey[600]};
  font-weight: 700;
`

export default TokenInput