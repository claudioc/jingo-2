import { distanceInWordsToNow } from 'date-fns';

export default (params => {
  const date = params;
  return distanceInWordsToNow(date) + ' ago';
});
