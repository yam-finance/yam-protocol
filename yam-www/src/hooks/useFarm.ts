import { useContext } from 'react'
import { Context as FarmsContext } from '../contexts/Farms'

const useFarm = (id: string) => {
  const { farms } = useContext(FarmsContext)
  const farm = farms.find(farm => farm.id === id)
  return [farm ? farm : {
    name: '',
    depositToken: '',
    earnToken: '',
    icon: '',
    id: '',
  }]
}

export default useFarm