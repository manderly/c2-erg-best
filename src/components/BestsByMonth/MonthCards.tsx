import React from 'react';
import _ from 'lodash';
import IndividualCardComponent from "./IndividualCard.component.tsx";

interface MonthCardsIF {
  bests: object,
}

export const MonthCards: React.FC<MonthCardsIF> = ({bests}) => {
  const sorted = _.orderBy((bests), 'date');
  return <>
    {Object.entries(sorted).map(([key, value]) => (
      <IndividualCardComponent key={`month-${key}`} month={key} data={value} />
    ))}
  </>
};