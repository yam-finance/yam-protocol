import { useContext } from 'react'
import { Context } from '../contexts/HamProvider'

const useHam = () => {
  const { yam } = useContext(Context)
  return yam
}

export default useYam