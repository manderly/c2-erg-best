import React from 'react';
import {MonthDataIF} from "../../types/types.ts";
import {parse, getDay, lastDayOfMonth, getDate} from 'date-fns';
import {Tooltip} from "@mantine/core";

const generateTableCells = (totalCells: number, cellsPerRow: number, month: string, data: MonthDataIF) => {
  // Determine which day of the week this month began on
  const monthNumber = parseInt(month, 10) + 1;
  const firstOfTheMonth = parse(`01 ${monthNumber} ${data.year}`, 'dd MM yyyy', new Date());
  // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeekIndex = getDay(firstOfTheMonth);

  const rows = [];
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const labelRow = [];
  for (let i = 0; i < dayLabels.length; i ++) {
    labelRow.push(<td key={`label-${dayLabels[i]}-${i}`} className='center-calendar-date day-label'>{dayLabels[i]}</td>);
  }
  rows.push(labelRow);

  let currentDay = 1;
  for (let i = 0; i < totalCells; i += cellsPerRow) {
    const row = [];
    for (let j = 0; j < cellsPerRow; j++) {
      if (i === 0 && j < dayOfWeekIndex) {
        row.push(<td key={`empty-${i}-${j}`}></td>); // Lead with empty cells until the first day of the month
      } else if (currentDay <= totalCells) {
        const rowData = data.rowErgDates[currentDay - 1];
        const bikeData = data.bikeErgDates[currentDay - 1];
        const skiData = data.skiErgDates[currentDay - 1];

        let tooltipLabel = '';
        let tooltipLabelDate = '';
        if (rowData) {
          const rowDistance = data.rowErgDates[currentDay - 1]?.distance;
          tooltipLabel += `Rowed ${rowDistance}m` ?? '';
          tooltipLabelDate = data.rowErgDates[currentDay - 1]?.date ?? '';
        }
        if (bikeData) {
          const bikeDistance = data.bikeErgDates[currentDay - 1]?.distance ?? '';
          const prefix = rowData ? ' and Biked' : 'Biked';
          tooltipLabel += `${prefix} ${bikeDistance}m`;
          tooltipLabelDate = data.bikeErgDates[currentDay - 1]?.date ?? '';
        }
        if (skiData) {
          const skiDistance = data.skiErgDates[currentDay - 1]?.distance ?? '';
          const prefix = rowData || bikeData ? ' and Skied' : 'Skied';
          tooltipLabel += `${prefix} ${skiDistance}m`;
          tooltipLabelDate = data.skiErgDates[currentDay - 1]?.date ?? '';
        }
        if (rowData || bikeData || skiData) {
          tooltipLabel += ` on ${tooltipLabelDate}`;
        }
        if (tooltipLabel === '') {
          tooltipLabel = 'No workout data for this date';
        }

        // style the cell to match ergs used that day
        const rowThisDay = rowData && !bikeData && !skiData ? 'row-this-day' : '';
        const bikeThisDay = bikeData && !rowData && !rowData ? 'bike-this-day' : '';
        const skiThisDay = skiData && !bikeData && !rowData ? 'ski-this-day' : '';
        // todo: add more combos (this is the only combo I can currently create with my own csv data)
        const rowAndBikeThisDay = rowData && bikeData && !skiData ? 'row-and-bike-this-day' : '';

        row.push(
          <Tooltip label={tooltipLabel}>
            <td key={currentDay}
                className={`center-calendar-date
                    ${rowThisDay} 
                    ${bikeThisDay} 
                    ${skiThisDay}
                    ${rowAndBikeThisDay}`}>
              {currentDay}
            </td>
          </Tooltip>
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

const CalendarComponent: React.FC<CalendarIF> = ({month, data}) => {
  // Determine how many days this month should have
  const lastDayOfTheMonth = lastDayOfMonth(new Date(data.year, parseInt(month), 1));
  const totalCells = getDate(lastDayOfTheMonth);
  const cellsPerRow = 7;

  return (
    <table className={"calendar"}>
      <tbody>
      {generateTableCells(totalCells, cellsPerRow, month, data)}
      </tbody>
    </table>
  );
};

export default CalendarComponent;