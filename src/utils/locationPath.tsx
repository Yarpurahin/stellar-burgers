import { Location } from 'react-router-dom';

export const getLocationPath = (location?: Location) =>
  location ? `${location.pathname}${location.search}${location.hash}` : '/';

export type LocationState = {
  from?: Location;
};
