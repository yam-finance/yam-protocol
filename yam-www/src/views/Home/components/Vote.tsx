import React from 'react'
import styled from 'styled-components'

import Button from '../../../components/Button'
import Card from '../../../components/Card'
import CardContent from '../../../components/CardContent'
import Label from '../../../components/Label'

interface VoteProps {
}

const Vote: React.FC<VoteProps> = () => {
  return (
    <Card>
      <CardContent>
        <Button disabled text="Vote" />
      </CardContent>
    </Card>
  )
}

export default Vote