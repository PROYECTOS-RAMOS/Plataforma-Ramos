import React from 'react'
import MarketingLoading from '../loading'

export default async function FaqLoading() {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return <MarketingLoading />
}
