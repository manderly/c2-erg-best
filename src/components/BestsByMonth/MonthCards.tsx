import React from 'react';
import _ from 'lodash';
import IndividualCardComponent from "./IndividualCard.component.tsx";

interface MonthCardsIF {
  bests: object,
  hasRowErg: boolean,
  hasBikeErg: boolean,
  hasSkiErg: boolean,
}

export const MonthCards: React.FC<MonthCardsIF> = ({bests, hasRowErg, hasBikeErg, hasSkiErg}) => {
  const sorted = _.orderBy((bests), 'date');
  return <div className={"month-cards"}>
    {Object.entries(sorted).map(([key, value]) => (
      <IndividualCardComponent key={`month-${key}`} month={key} data={value} hasRowErg={hasRowErg} hasBikeErg={hasBikeErg} hasSkiErg={hasSkiErg} />
    ))}
  </div>
};