import React from 'react';
import _ from 'lodash';
import IndividualCardComponent from "./IndividualCard.component.tsx";
import {Flex} from "@mantine/core";

interface MonthCardsIF {
  bests: object,
  hasRowErg: boolean,
  hasBikeErg: boolean,
  hasSkiErg: boolean,
}

export const MonthCards: React.FC<MonthCardsIF> = ({bests, hasRowErg, hasBikeErg, hasSkiErg}) => {
  const sorted = _.orderBy((bests), 'date');
  return <Flex
    mih={600}
    justify="space-between"
    align="space-between"
    direction="row"
    wrap="wrap"
  >
    {Object.entries(sorted).map(([key, value]) => (
      <IndividualCardComponent key={`month-${key}`} month={key} data={value} hasRowErg={hasRowErg} hasBikeErg={hasBikeErg} hasSkiErg={hasSkiErg} />
    ))}
  </Flex>
};