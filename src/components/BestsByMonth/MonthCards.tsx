import React from "react";
import _ from "lodash";
import IndividualCardComponent from "./IndividualCard.component.tsx";
import { LocalBests } from "../../types/types.ts";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store.ts";

interface MonthCardsIF {
  bests: LocalBests;
}

export const MonthCards: React.FC<MonthCardsIF> = ({ bests }) => {
  const ergDataState = useSelector((state: RootState) => state.ergData);
  const sorted = _.orderBy(bests[ergDataState.viewingYear], "date");
  return (
    <div className={"month-cards"}>
      {Object.entries(sorted).map(([key, value]) => (
        <IndividualCardComponent
          key={`month-${key}`}
          month={key}
          data={value}
        />
      ))}
    </div>
  );
};
