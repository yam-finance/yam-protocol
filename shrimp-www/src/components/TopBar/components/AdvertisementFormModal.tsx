import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { useForm, SubmitHandler } from "react-hook-form";

import { yam as yamAddress } from '../../../constants/tokenAddresses'
import useTokenBalance from '../../../hooks/useTokenBalance'
import { getDisplayBalance } from '../../../utils/formatBalance'

import Button from '../../Button'
import CardIcon from '../../CardIcon'
import IconButton from '../../IconButton'
import { AddIcon, RemoveIcon } from '../../icons'
import Label from '../../Label'
import Modalmd, { ModalProps } from '../../Modal'
import ModalTitle from '../../ModalTitle'

import { useWallet } from 'use-wallet'

import { sendAdRequest } from '../../../yamUtils/index'

const AccountModal: React.FC<ModalProps> = ({ onDismiss }) => {

  const { account, ethereum } = useWallet()

  type FormValues = {
    website: string;
    telegram: string;
    twitter: string;
  };
  const { handleSubmit, register } = useForm();
  const onSubmit: SubmitHandler<FormValues> = data => {
    let message = (`website - ${data.website}, telegram - ${data.telegram}, twitter - ${data.twitter}`)
    sendAdRequest(ethereum, message, account)
  };

  const yamBalance = useTokenBalance(yamAddress)
  const displayBalance = useMemo(() => {
    return getDisplayBalance(yamBalance)
  }, [yamBalance])

  return (
    <Modalmd>
      <ModalTitle text="New Pool proposal" />

      <StyledBalanceWrapper>
        <StyledBalance>
          <Label text="Contact us to start a pool." />
        </StyledBalance>
        <StyledBalanceActions>
          <form onSubmit={handleSubmit(onSubmit)}>
          <StyledInputWrapper>
            <label>
              Website:
              <StyledInput
              type='text'
              ref={register}
               name='website' />
              </label>
          </StyledInputWrapper>
          <br/>
          <StyledInputWrapper>
            <label>
              Telegram:
              <StyledInput
              type='text'
              ref={register}
               name='telegram' />
              </label>
          </StyledInputWrapper>
          <br/>
          <StyledInputWrapper>
            <label>
              Twitter:
              <StyledInput 
              type='text'
              ref={register}
               name='twitter' />
              </label>
          </StyledInputWrapper>
          <StyledSpacer />
          <StyledSubmitWrapper>
        <Styledsubmit 
        type='submit' />
        </StyledSubmitWrapper>
          </form>
        </StyledBalanceActions>
      </StyledBalanceWrapper>

      
    </Modalmd>
  )
}

const StyledSpacer = styled.div`
  height: ${props => props.theme.spacing[4]}px;
  width: ${props => props.theme.spacing[4]}px;
`

const StyledValue = styled.div`
  color: ${props => props.theme.color.grey[600]};
  font-size: 36px;
  font-weight: 700;
`

const StyledBalance = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`

const StyledBalanceWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-bottom: ${props => props.theme.spacing[4]}px;
`

const StyledBalanceIcon = styled.div`
  font-size: 36px;
  margin-right: ${props => props.theme.spacing[3]}px;
`

const StyledBalanceActions = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-top: ${props => props.theme.spacing[4]}px;
`
const StyledInputWrapper = styled.div`
  align-items: center;
  background-color: ${props => props.theme.color.grey[200]};
  border-radius: ${props => props.theme.borderRadius}px;
  box-shadow: inset 4px 4px 8px ${props => props.theme.color.grey[300]},
    inset -6px -6px 12px ${props => props.theme.color.grey[100]};
  display: flex;
  width: 300px;
  height: 50px;
  text-align: left;
  padding: 0 ${props => props.theme.spacing[1]}px;
`

const StyledInput = styled.input`
  background: none;
  border: 0;
  color: ${props => props.theme.color.grey[600]};
  font-size: 18px;
  flex: 1;
  height: 30px;
  margin: 0;
  padding: 0;
  outline: none;
`

const StyledSubmitWrapper = styled.div`
  align-items: center;
  cursor: pointer;
  background-color: ${props => props.theme.color.grey[200]};
  border-radius: ${props => props.theme.borderRadius}px;
  box-shadow: 4px 4px 8px ${props => props.theme.color.grey[300]},
    inset -6px -6px 12px ${props => props.theme.color.grey[100]};
  display: flex;
  width: 300px;
  height: 50px;
  text-align: center;
  padding: 0 ${props => props.theme.spacing[1]}px;
`

const Styledsubmit = styled.input`
  cursor: pointer;
  text-align: center;
  background: none;
  border: 0;
  color: ${props => props.theme.color.grey[600]};
  font-size: 18px;
  flex: 1;
  height: 30px;
  margin: 0;
  padding: 0;
  outline: none;
`

export default AccountModal