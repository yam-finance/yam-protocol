import React from 'react'
import styled from 'styled-components'

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <StyledLink href="https://github.com/shrimp-finance/shrimp-protocol">Github</StyledLink>
      <StyledLink href="https://twitter.com/FinanceShrimp">Twitter</StyledLink>
      <StyledLink href="https://t.me/shrimping">Telegram</StyledLink>
      <StyledLink href="https://www.coingecko.com/en/coins/shrimp-finance">Coingecko</StyledLink>
    </StyledNav>
  )
}

const StyledNav = styled.nav`
  align-items: center;
  display: flex;
`

const StyledLink = styled.a`
  color: ${props => props.theme.color.grey[400]};
  padding-left: ${props => props.theme.spacing[3]}px;
  padding-right: ${props => props.theme.spacing[3]}px;
  text-decoration: none;
  &:hover {
    color: ${props => props.theme.color.grey[500]};
  }
`

export default Nav