import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'

import Icon, { IconProps } from '../Icon'

const RemoveIcon: React.FC<IconProps> = ({ color, size }) => {
  const { color: themeColor } = useContext(ThemeContext)
  return (
    <Icon>
      <svg
        viewBox="0 0 24 24"
        fill={color ? color : themeColor.grey[400]}
        width={size * 0.75}
        height={size * 0.75}
      >
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M19 13H5v-2h14v2z"/>
      </svg>

    </Icon>
  )
}

export default RemoveIcon