let helper
import { distanceInWordsToNow } from 'date-fns'

export default helper = (params) => {
  const date = params.hash
  return distanceInWordsToNow(date) + ' ago'
}
