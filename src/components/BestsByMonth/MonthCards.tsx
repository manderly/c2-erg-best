import React from "react";
import _ from "lodash";
import IndividualCardComponent from "./IndividualCard.component.tsx";
import { ErgDataByYear } from "../../types/types.ts";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store.ts";

interface MonthCardsIF {
  data: ErgDataByYear;
  onMonthClick?: (monthData: any) => void;
  selectedMonth?: { name: string; year: number };
}

export const MonthCards: React.FC<MonthCardsIF> = ({
  data,
  onMonthClick,
  selectedMonth,
}) => {
  const ergDataState = useSelector((state: RootState) => state.ergData);
  const sorted = _.orderBy(data[ergDataState.viewingYear], "date");
  return (
    <div className={"month-cards"}>
      {Object.entries(sorted).map(([key, value]) => (
        <IndividualCardComponent
          key={`month-${key}`}
          month={key}
          data={value}
          onClick={() => onMonthClick && onMonthClick(value)}
          isSelected={
            selectedMonth &&
            selectedMonth.name === value.name &&
            selectedMonth.year === value.year
          }
        />
      ))}
    </div>
  );
};
