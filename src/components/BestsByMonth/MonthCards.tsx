import React from "react";
import _ from "lodash";
import IndividualCardComponent from "./IndividualCard.component.tsx";
import { ErgDataByYear } from "../../types/types.ts";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store.ts";

interface MonthCardsIF {
  data: ErgDataByYear;
}

export const MonthCards: React.FC<MonthCardsIF> = ({ data }) => {
  const ergDataState = useSelector((state: RootState) => state.ergData);
  const sorted = _.orderBy(data[ergDataState.viewingYear], "date");
  return (
    <>
      {!_.isEmpty(data) ? (
        <h2 className={"pad-bottom"}>{ergDataState.viewingYear}</h2>
      ) : (
        <></>
      )}
      <div className={"month-cards"}>
        {Object.entries(sorted).map(([key, value]) => (
          <IndividualCardComponent
            key={`month-${key}`}
            month={key}
            data={value}
          />
        ))}
      </div>
    </>
  );
};
