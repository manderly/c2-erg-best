import React from 'react';
import {MonthDataIF} from "../types/types.ts";
import {parse, getDay, lastDayOfMonth, getDate} from 'date-fns';

const generateTableCells = (totalCells: number, cellsPerRow: number, month: string, data: MonthDataIF) => {
  // Determine which day of the week this month began on
  const monthNumber = parseInt(month, 10) + 1;
  const firstOfTheMonth = parse(`01 ${monthNumber} ${data.year}`, 'dd MM yyyy', new Date());
  // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeekIndex = getDay(firstOfTheMonth);

  const rows = [];
  let currentDay = 1;

  for (let i = 0; i < totalCells; i += cellsPerRow) {
    const row = [];
    for (let j = 0; j < cellsPerRow; j++) {
      if (i === 0 && j < dayOfWeekIndex) {
        row.push(<td key={`empty-${i}-${j}`}></td>); // Lead with empty cells until the first day of the month
      } else if (currentDay <= totalCells) {
        const rowThisDay = data.rowErgDates[currentDay - 1] === 1 ? 'row-this-day' : '';
        const bikeThisDay = data.bikeErgDates[currentDay - 1] === 1 ? 'bike-this-day' : '';
        const skiThisDay = data.skiErgDates[currentDay - 1] === 1 ? 'ski-this-day' : '';

        row.push(<td key={currentDay} className={`center-calendar-date ${rowThisDay} ${bikeThisDay} ${skiThisDay}`}>
          {currentDay}
        </td>
        );
        currentDay++;
      } else {
        row.push(<td key={`empty-${i}-${j}`}></td>); // Fill empty cells if necessary
      }
    }
    rows.push(<tr key={i}>{row}</tr>);
  }
  return rows;
};

interface CalendarIF {
  month: string;
  data: MonthDataIF;
}

const Calendar: React.FC<CalendarIF> = ({month, data}) => {
  // Determine how many days this month should have
  const lastDayOfTheMonth = lastDayOfMonth(new Date(data.year, parseInt(month), 1));
  const totalCells = getDate(lastDayOfTheMonth);
  const cellsPerRow = 7;

  return (
    <table>
      <tbody>
      {generateTableCells(totalCells, cellsPerRow, month, data)}
      </tbody>
    </table>
  );
};

export default Calendar;