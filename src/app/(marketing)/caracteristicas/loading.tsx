import React from 'react'
import MarketingLoading from '../loading'

export default async function GenericMarketingLoading() {
  // Garantizar una pausa mínima de 500 ms para apreciar el Skeleton fluidamente
  await new Promise((resolve) => setTimeout(resolve, 500))
  return <MarketingLoading />
}
