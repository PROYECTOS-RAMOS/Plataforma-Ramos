import React from 'react'
import MarketingLoading from '../loading'

export default async function ComoFuncionaLoading() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return <MarketingLoading />
}
