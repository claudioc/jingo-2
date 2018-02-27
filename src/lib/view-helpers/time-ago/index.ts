let helper
import { distanceInWordsToNow } from 'date-fns'

export default (helper = params => {
  const date = params
  return distanceInWordsToNow(date) + ' ago'
})
