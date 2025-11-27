'use client'

import dynamic from 'next/dynamic'

// Lazy load ScrollTopAndComment component
const ScrollTopAndComment = dynamic(() => import('@/components/scroll-top-and-comment'), {
  ssr: false,
  loading: () => null,
})

export const ScrollTopAndCommentWrapper = () => {
  return <ScrollTopAndComment />
}
