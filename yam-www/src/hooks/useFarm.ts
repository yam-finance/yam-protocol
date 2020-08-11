import { useContext } from 'react'
import { Context as FarmsContext, Farm } from '../contexts/Farms'

const useFarm = (id: string): Farm => {
  const { farms } = useContext(FarmsContext)
  const farm = farms.find(farm => farm.id === id)
  return farm ? farm : {
    name: '',
    depositToken: '',
    depositTokenAddress: '',
    earnToken: '',
    earnTokenAddress: '',
    icon: '',
    id: '',
  }
}

export default useFarm