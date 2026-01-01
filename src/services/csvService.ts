import Papa, { ParseResult } from "papaparse";
import _ from "lodash";
import {
  getErgTypeFromRow,
  getMonthNumber,
  getRowData,
  getRowYear,
  parseTimeToMilliseconds,
} from "./formatting_utils";
import {
  ParsedCSVRowDataIF,
  ErgDataByYear,
  SessionDataIF,
  csvRow,
  ErgDataIF,
} from "../types/types";
import type { Dispatch } from "redux";
import { englishMonths, RIDICULOUS_FUTURE_TIMESTAMP } from "../consts/consts";

export const fetchLocalCSVFile = async (
  fileName: string,
): Promise<File | null> => {
  try {
    const response = await fetch(fileName);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    return new File([blob], "local.csv", { type: blob.type });
  } catch (e) {
    console.log(e);
    return null;
  }
};

const getDefaultErgData = () => ({
  bestDistance: { value: 0, date: 0, workoutId: "" },
  bestPace: { value: "999:00.0", date: 0, workoutId: "" },
  bestStroke: { value: 0, date: 0, workoutId: "" },
  bestWorkTime: { value: 0, date: 0, workoutId: "" },
  bestWattsAvg: { value: 0, date: 0, workoutId: "" },
  workDistanceSum: 0,
  restDistanceSum: 0,
  workTimeSum: 0,
  restTimeSum: 0,
  sessionCount: 0,
});

export const buildEmptyMonth = (localMonth: string, localYear: string) => {
  return {
    name: localMonth,
    year: Number(localYear),
    rowErg: _.cloneDeep(getDefaultErgData()),
    bikeErg: _.cloneDeep(getDefaultErgData()),
    skiErg: _.cloneDeep(getDefaultErgData()),
    rowErgSessionsByDayOfMonth: [...Array(32)].map((): SessionDataIF[] => []),
    bikeErgSessionsByDayOfMonth: [...Array(32)].map((): SessionDataIF[] => []),
    skiErgSessionsByDayOfMonth: [...Array(32)].map((): SessionDataIF[] => []),
    metersAll: 0,
  };
};

export const getSessionData = (parsedCSVRow: ParsedCSVRowDataIF) => {
  return {
    date: parsedCSVRow.date,
    ergType: parsedCSVRow.type,
    distance: parsedCSVRow.workDistance,
    time: String(parsedCSVRow.workTime),
  };
};

export const parseCSVFiles = (
  files: (File | null)[],
  dispatch: Dispatch,
  setErgData: React.Dispatch<React.SetStateAction<ErgDataIF>>,
  setYears: React.Dispatch<React.SetStateAction<string[]>>,
  setUnfilteredRowData: React.Dispatch<
    React.SetStateAction<ParsedCSVRowDataIF[]>
  >,
  setWorkDistanceSums: React.Dispatch<
    React.SetStateAction<{ rowErg: number; bikeErg: number; skiErg: number }>
  >,
  setIsDoneLoadingCSVData: (value: boolean) => void,
) => {
  let mostRecentYear = 0;
  const localYears: string[] = [];
  const localWorkDistanceSums = {
    rowErg: 0,
    bikeErg: 0,
    skiErg: 0,
  };
  const combinedUnfilteredRowData: ParsedCSVRowDataIF[] = [];
  const localErgDataByYear: ErgDataByYear = {};
  let localMetersSum = 0;
  let localErgTimeSum = 0;
  let localEarliestDate = RIDICULOUS_FUTURE_TIMESTAMP;
  let localLatestDate = 0;
  let localRowMetersSum = 0;
  let localBikeMetersSum = 0;
  let localSkiMetersSum = 0;

  if (files) {
    files.forEach((file) => {
      if (file) {
        Papa.parse(file, {
          complete: function (results: ParseResult<string[]>) {
            results.data.shift();
            _.chain(results.data)
              .filter((row: csvRow) => row.length > 1)
              .orderBy((row: csvRow) => row[1])
              .map((row: csvRow) => {
                const parsedCSVRow: ParsedCSVRowDataIF = getRowData(row);
                const ergType = getErgTypeFromRow(row);
                if (parsedCSVRow.date < localEarliestDate) {
                  localEarliestDate = parsedCSVRow.date;
                }
                if (parsedCSVRow.date > localLatestDate) {
                  localLatestDate = parsedCSVRow.date;
                }
                const localYear = String(getRowYear(parsedCSVRow.date));
                if (!localYears.includes(localYear)) {
                  localYears.push(localYear);
                }
                if (Number(localYear) > mostRecentYear) {
                  mostRecentYear = Number(localYear);
                  dispatch &&
                    dispatch({
                      type: "ergData/setViewingYear",
                      payload: localYear,
                    });
                }
                localMetersSum +=
                  parsedCSVRow.workDistance + parsedCSVRow.restDistance;
                localErgTimeSum +=
                  Number(parsedCSVRow.workTime) + Number(parsedCSVRow.restTime);
                if (localErgDataByYear[localYear] === undefined) {
                  localErgDataByYear[localYear] = {};
                  englishMonths.map((month) => {
                    localErgDataByYear[localYear][month] = _.cloneDeep(
                      buildEmptyMonth(month, localYear),
                    );
                  });
                }
                const monthIdx = getMonthNumber(parsedCSVRow.date) - 1;
                const monthName = englishMonths[monthIdx];
                const ergMachineData =
                  localErgDataByYear?.[localYear]?.[monthName]?.[ergType];
                if (ergMachineData) {
                  if (
                    parsedCSVRow.workDistance >
                    Number(ergMachineData.bestDistance.value ?? 0)
                  ) {
                    ergMachineData.bestDistance.value =
                      parsedCSVRow.workDistance;
                    ergMachineData.bestDistance.date = parsedCSVRow.date;
                    ergMachineData.bestDistance.workoutId = parsedCSVRow.id;
                  }
                  if (
                    parseTimeToMilliseconds(parsedCSVRow.pace) <
                    parseTimeToMilliseconds(
                      String(ergMachineData.bestPace.value),
                    )
                  ) {
                    ergMachineData.bestPace.value = parsedCSVRow.pace;
                    ergMachineData.bestPace.date = parsedCSVRow.date;
                    ergMachineData.bestPace.workoutId = parsedCSVRow.id;
                  }
                  if (
                    parsedCSVRow.strokeRate >
                    Number(ergMachineData.bestStroke.value)
                  ) {
                    ergMachineData.bestStroke.value = parsedCSVRow.strokeRate;
                    ergMachineData.bestStroke.date = parsedCSVRow.date;
                    ergMachineData.bestStroke.workoutId = parsedCSVRow.id;
                  }
                  if (
                    Number(parsedCSVRow.workTime) >
                    Number(ergMachineData.bestWorkTime.value)
                  ) {
                    ergMachineData.bestWorkTime.value = parsedCSVRow.workTime;
                    ergMachineData.bestWorkTime.date = parsedCSVRow.date;
                    ergMachineData.bestWorkTime.workoutId = parsedCSVRow.id;
                  }
                  if (
                    Number(parsedCSVRow.watts) >
                    Number(ergMachineData.bestWattsAvg.value)
                  ) {
                    ergMachineData.bestWattsAvg.value = parsedCSVRow.watts;
                    ergMachineData.bestWattsAvg.date = parsedCSVRow.date;
                    ergMachineData.bestWattsAvg.workoutId = parsedCSVRow.id;
                  }
                }
                const month = localErgDataByYear[localYear][monthName];
                month[ergType].sessionCount += 1;
                month[ergType].workDistanceSum += parsedCSVRow.workDistance;
                month[ergType].restDistanceSum += parsedCSVRow.restDistance;
                month[ergType].workTimeSum += parsedCSVRow.workTime;
                month[ergType].restTimeSum += parsedCSVRow.restTime;
                month.metersAll += parsedCSVRow.workDistance;
                localWorkDistanceSums[ergType] += parsedCSVRow.workDistance;
                if (ergType === "rowErg") {
                  dispatch && dispatch({ type: "ergData/setHasRowErg" });
                  const newSession = getSessionData(parsedCSVRow);
                  month.rowErgSessionsByDayOfMonth[parsedCSVRow.day].push(
                    newSession,
                  );
                  localRowMetersSum += parsedCSVRow.workDistance;
                } else if (ergType === "bikeErg") {
                  dispatch && dispatch({ type: "ergData/setHasBikeErg" });
                  const newSession = getSessionData(parsedCSVRow);
                  month.bikeErgSessionsByDayOfMonth[parsedCSVRow.day].push(
                    newSession,
                  );
                  localBikeMetersSum += parsedCSVRow.workDistance;
                } else if (ergType === "skiErg") {
                  dispatch && dispatch({ type: "ergData/setHasSkiErg" });
                  const newSession = getSessionData(parsedCSVRow);
                  month.skiErgSessionsByDayOfMonth[parsedCSVRow.day].push(
                    newSession,
                  );
                  localSkiMetersSum += parsedCSVRow.workDistance;
                } else {
                  console.log("Unsupported erg type found: " + ergType);
                }
                combinedUnfilteredRowData.push(parsedCSVRow);
                return parsedCSVRow;
              })
              .value();
            const tempErgData = {
              ergDataByYear: localErgDataByYear,
              allTimeSums: {
                totalMeters: localMetersSum,
                totalErgTime: localErgTimeSum,
                earliestDate: localEarliestDate,
                latestDate: localLatestDate,
                totalRowErgMeters: localRowMetersSum,
                totalBikeErgMeters: localBikeMetersSum,
                totalSkiErgMeters: localSkiMetersSum,
              },
              years: localYears,
            };
            setErgData && setErgData(tempErgData);
            setYears && setYears(localYears);
            setUnfilteredRowData &&
              setUnfilteredRowData(combinedUnfilteredRowData);
            setWorkDistanceSums && setWorkDistanceSums(localWorkDistanceSums);
          },
        });
      }
    });
  }
  setIsDoneLoadingCSVData && setIsDoneLoadingCSVData(true);
};
