import {rawRowData} from "./localData";
import cloneDeep from 'lodash.clonedeep';

export const filterRows = (includeRower, includeBike) => {
  const copiedRowData = cloneDeep(rawRowData);
  const filteredRows = copiedRowData.filter((row) => {
    if (row.ergType === 'Row' && includeRower) {
      return true;
    }
    if (row.ergType === 'Bike' && includeBike) {
      return true;
    }
    return false;
  });

  return filteredRows;
}

