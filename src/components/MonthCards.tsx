import React from 'react';
import _ from 'lodash';
import IndividualCard from "./IndividualCard.tsx";

interface MonthCardsIF {
  bests: object,
  hasRowErg: boolean,
  hasBikeErg: boolean,
  hasSkiErg: boolean,
}

export const MonthCards: React.FC<MonthCardsIF> = ({bests, hasRowErg, hasBikeErg, hasSkiErg }) => {
  const sorted = _.orderBy((bests), 'date');
  return <>
    {Object.entries(sorted).map(([key, value]) => (
      <IndividualCard key={`month-${key}`} month={key} data={value} hasRowErg={hasRowErg} hasBikeErg={hasBikeErg} hasSkiErg={hasSkiErg} />
    ))}
  </>
};