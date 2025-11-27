'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../sanity/sanity.config'

export default function Page() {
  return <NextStudio config={config} />
}

Page.displayName = 'StudioPage'
