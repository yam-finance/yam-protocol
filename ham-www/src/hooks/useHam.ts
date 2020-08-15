import { useContext } from 'react'
import { Context } from '../contexts/HamProvider'

const useHam = () => {
  const { ham } = useContext(Context)
  return ham
}

export default useHam
