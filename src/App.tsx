import { useState, useEffect, FormEvent } from "react";
import "./App.css";
import "@mantine/core/styles.css";
import { Divider, FileInput, MantineProvider, Radio } from "@mantine/core";
import { Grid, Button, Flex } from "@mantine/core";

import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import Papa, { ParseResult } from "papaparse";
import _ from "lodash";
import {
  getDayOfMonth,
  getFormattedDate,
  getFormattedDistance,
  getFormattedDistanceString,
  getFormattedTime,
  getMonthNumber,
  getRowYear,
  parseTimeToMilliseconds,
} from "./services/formatting_utils";
import { MonthCards } from "./components/BestsByMonth/MonthCards.tsx";
import {
  BestDataForErgIF,
  ErgType,
  ParsedCSVRowDataIF,
  DateAndDistanceIF,
  DateAndPaceIF,
  LocalBests,
  TrendsDataIF,
  DateAndWorkTimeIF,
  WorkDistanceSumsIF,
  SessionDataIF,
} from "./types/types.ts";
import { TrendsComponent } from "./components/TrendCharts/Trends.component.tsx";
import { WorkoutTableComponent } from "./components/WorkoutTable/WorkoutTable.component.tsx";
import { useDispatch } from "react-redux";
import {
  setHasBikeErg,
  setHasRowErg,
  setHasSkiErg,
} from "./store/ergDataSlice";
import ErgProportions from "./components/ErgProportionsMeter/ErgProportions.component.tsx";

const csvFiles = ["/concept2-season-2024.csv", "/concept2-season-2025.csv"];
const TEST_MODE = true;

const DEFAULT_RECORD_DATA: BestDataForErgIF = {
  bestDistance: {
    value: 0,
    date: "",
    workoutId: "",
  },
  bestPace: {
    value: "999:00.0",
    date: "",
    workoutId: "",
  },
  bestStroke: {
    value: 0,
    date: "",
    workoutId: "",
  },
  bestWorkTime: {
    value: 0,
    date: "",
    workoutId: "",
  },
  workDistanceSum: 0,
  workTimeSum: 0,
};

const workDistanceSums: WorkDistanceSumsIF = {
  rowErg: 0,
  bikeErg: 0,
  skiErg: 0,
};

function App() {
  const dispatch = useDispatch();

  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ] as const;

  const [isDoneLoading, setIsDoneLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [unfilteredRowData, setUnfilteredRowData] = useState<
    ParsedCSVRowDataIF[]
  >([]);
  const [bests, setBests] = useState({});
  const [trends, setTrends] = useState<TrendsDataIF | undefined>(undefined);
  const [totalMeters, setTotalMeters] = useState<number>(0);

  useEffect(() => {
    if (TEST_MODE) {
      // use sample data (my own) to populate the page
      const fetchData = async () => {
        const filePromises = _.map(csvFiles, (fileName) =>
          fetchLocalCSVFile(fileName),
        );

        const files = await Promise.all(filePromises);

        files.forEach((file) => {
          if (file) {
            parseCSVIntoChartData(file);
          }
        });

        setIsDoneLoading(true);
      };

      fetchData();
    } else {
      console.log("Waiting for file upload");
    }
  }, []);

  const getSessionData = (parsedCSVRowData: ParsedCSVRowDataIF) => {
    return {
      date: parsedCSVRowData.date,
      ergType: parsedCSVRowData.type,
      distance: parsedCSVRowData.workDistance,
      time: String(parsedCSVRowData.workTime),
    };
  };

  const fetchLocalCSVFile = async (fileName: string): Promise<File | null> => {
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

  const handleCSVInput = (payload: File | null) => {
    setFile(payload);
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    parseCSVIntoChartData(file);
  };

  const localDistanceTrendsRow: DateAndDistanceIF[] = [];
  const localPaceTrendsRow: DateAndPaceIF[] = [];
  const localWorkTimeTrendsRow: DateAndWorkTimeIF[] = [];

  const localDistanceTrendsBike: DateAndDistanceIF[] = [];
  const localPaceTrendsBike: DateAndPaceIF[] = [];
  const localWorkTimeTrendsBike: DateAndWorkTimeIF[] = [];

  const localDistanceTrendsSki: DateAndDistanceIF[] = [];
  const localPaceTrendsSki: DateAndPaceIF[] = [];
  const localWorkTimeTrendsSki: DateAndWorkTimeIF[] = [];

  const combinedUnfilteredRowData: ParsedCSVRowDataIF[] = [];
  const localBests: LocalBests = {};
  let localMetersSum = 0;

  const parseCSVIntoChartData = (file: File | null) => {
    if (file) {
      Papa.parse(file, {
        complete: function (results: ParseResult<string[]>) {
          results.data.shift();

          // process the row data line by line from the csv
          _.chain(results.data)
            .filter((row: (string | number)[]) => row.length > 1)
            .orderBy((row: (string | number)[]) => row[1]) // date
            .map((row: (string | number)[]) => {
              const ergType = (String(row[19]).charAt(0).toLowerCase() +
                String(row[19]).slice(1)) as "bikeErg" | "rowErg" | "skiErg";

              // row data from the CSV ("row" as in table rows, not RowErg)
              const parsedCSVRowData: ParsedCSVRowDataIF = {
                dateRaw: String(row[1]),
                date: getFormattedDate(String(row[1])),
                day: getDayOfMonth(String(row[1])),
                startTime: getFormattedTime(String(row[1])),
                type: ergType as ErgType,
                description: String(row[2]),
                pace: String(row[11]), // example: 2:37.4
                workTime: Number(row[4]), // example: 1234.5
                restTime: Number(row[6]),
                workDistance: getFormattedDistance(row[7] as string),
                restDistance: getFormattedDistance(row[8] as string),
                strokeRate: Number(row[9]),
                strokeCount: Number(row[10]),
                totalCal: `${row[14]} (${row[13]} cal/hr)`,
                avgHeartRate: Number(row[15]),
                dragFactor: Number(row[16]),
                ranked: Boolean(row[20]),
                id: String(row[0]),
              };

              // add these meters to the sum for this date
              localMetersSum +=
                parsedCSVRowData.workDistance + parsedCSVRowData.restDistance;

              // build "bests" data object
              const monthIdx = getMonthNumber(parsedCSVRowData.date) - 1;
              const monthName = MONTH_NAMES[monthIdx];

              // there is no data for this month - create it
              if (localBests[monthName] === undefined) {
                localBests[monthName] = {
                  name: monthName,
                  year: getRowYear(parsedCSVRowData.date),
                  rowErg: _.cloneDeep(DEFAULT_RECORD_DATA),
                  bikeErg: _.cloneDeep(DEFAULT_RECORD_DATA),
                  skiErg: _.cloneDeep(DEFAULT_RECORD_DATA),
                  rowErgCount: 0,
                  bikeErgCount: 0,
                  skiErgCount: 0,
                  rowErgSessionsByDayOfMonth: [...Array(32)].map(
                    (): SessionDataIF[] => [],
                  ),
                  bikeErgSessionsByDayOfMonth: [...Array(32)].map(
                    (): SessionDataIF[] => [],
                  ),
                  skiErgSessionsByDayOfMonth: [...Array(32)].map(
                    (): SessionDataIF[] => [],
                  ),
                } as const;
              }

              const localErgType = localBests?.[monthName]?.[ergType];
              if (localErgType) {
                // Update best distance, if better
                if (
                  parsedCSVRowData.workDistance >
                  Number(localErgType.bestDistance.value ?? 0)
                ) {
                  localErgType.bestDistance.value =
                    parsedCSVRowData.workDistance;
                  localErgType.bestDistance.date = parsedCSVRowData.date;
                  localErgType.bestDistance.workoutId = parsedCSVRowData.id;
                }

                // Update best pace, if better
                if (
                  parseTimeToMilliseconds(parsedCSVRowData.pace) <
                  parseTimeToMilliseconds(String(localErgType.bestPace.value))
                ) {
                  localErgType.bestPace.value = parsedCSVRowData.pace;
                  localErgType.bestPace.date = parsedCSVRowData.date;
                  localErgType.bestPace.workoutId = parsedCSVRowData.id;
                }

                // Update best strokeRate, if better
                if (
                  parsedCSVRowData.strokeRate >
                  Number(localErgType.bestStroke.value)
                ) {
                  localErgType.bestStroke.value = parsedCSVRowData.strokeRate;
                  localErgType.bestStroke.date = parsedCSVRowData.date;
                  localErgType.bestStroke.workoutId = parsedCSVRowData.id;
                }

                // Update best workTime, if better
                if (
                  Number(parsedCSVRowData.workTime) >
                  Number(localErgType.bestWorkTime.value)
                ) {
                  localErgType.bestWorkTime.value = parsedCSVRowData.workTime;
                  localErgType.bestWorkTime.date = parsedCSVRowData.date;
                  localErgType.bestWorkTime.workoutId = parsedCSVRowData.id;
                }
              }

              /**
               * Multiple workouts of the same type in the same day are aggregated
               * for the sake of calculating day-over-day trends
               **/
              const newDistance: { date: string; distance: number } = {
                date: parsedCSVRowData.date,
                distance:
                  parsedCSVRowData.workDistance + parsedCSVRowData.restDistance,
              };
              const newPace: { date: string; pace: number } = {
                date: parsedCSVRowData.date,
                pace: parseTimeToMilliseconds(parsedCSVRowData.pace),
              };
              const newWorkTime: { date: string; workTime: number } = {
                date: parsedCSVRowData.date,
                workTime: parsedCSVRowData.workTime,
              };

              const month = localBests[monthName];

              if (ergType === "rowErg") {
                dispatch(setHasRowErg());
                localDistanceTrendsRow.push(newDistance);
                localPaceTrendsRow.push(newPace);
                localWorkTimeTrendsRow.push(newWorkTime);
                if (month?.rowErgCount !== undefined) {
                  month.rowErgCount = month.rowErgCount + 1;

                  // push new entry to the correct day of the month array
                  const newSession = getSessionData(parsedCSVRowData);
                  month.rowErgSessionsByDayOfMonth[parsedCSVRowData.day].push(
                    newSession,
                  );

                  month.rowErg.workDistanceSum =
                    month.rowErg.workDistanceSum +
                    parsedCSVRowData.workDistance +
                    parsedCSVRowData.restDistance;
                  month.rowErg.workTimeSum =
                    month.rowErg.workTimeSum + parsedCSVRowData.workTime;
                  workDistanceSums.rowErg =
                    workDistanceSums.rowErg + parsedCSVRowData.workDistance;
                }
              } else if (ergType === "bikeErg") {
                dispatch(setHasBikeErg());
                localDistanceTrendsBike.push(newDistance);
                localPaceTrendsBike.push(newPace);
                localWorkTimeTrendsBike.push(newWorkTime);
                if (month?.bikeErgCount !== undefined) {
                  month.bikeErgCount = month.bikeErgCount + 1;

                  // push new entry to the correct day of the month array
                  const newSession = getSessionData(parsedCSVRowData);
                  month.bikeErgSessionsByDayOfMonth[parsedCSVRowData.day].push(
                    newSession,
                  );

                  month.bikeErg.workDistanceSum =
                    month.bikeErg.workDistanceSum +
                    parsedCSVRowData.workDistance;
                  month.bikeErg.workTimeSum =
                    month.bikeErg.workTimeSum + parsedCSVRowData.workTime;
                  workDistanceSums.bikeErg =
                    workDistanceSums.bikeErg + parsedCSVRowData.workDistance;
                }
              } else if (ergType === "skiErg") {
                dispatch(setHasSkiErg());
                localDistanceTrendsSki.push(newDistance);
                localPaceTrendsSki.push(newPace);
                localWorkTimeTrendsSki.push(newWorkTime);
                if (month?.skiErgCount !== undefined) {
                  month.skiErgCount = month.skiErgCount + 1;

                  // push new entry to the correct day of the month array
                  const newSession = getSessionData(parsedCSVRowData);
                  month.skiErgSessionsByDayOfMonth[parsedCSVRowData.day].push(
                    newSession,
                  );

                  month.skiErg.workDistanceSum =
                    month.skiErg.workDistanceSum +
                    parsedCSVRowData.workDistance;
                  month.skiErg.workTimeSum =
                    month.skiErg.workTimeSum + parsedCSVRowData.workTime;
                  workDistanceSums.skiErg =
                    workDistanceSums.skiErg + parsedCSVRowData.workDistance;
                }
              } else {
                console.log("Unsupported erg type found");
              }

              combinedUnfilteredRowData.push(parsedCSVRowData);
              return parsedCSVRowData;
            })
            .value();

          setBests(localBests);
          setTotalMeters(localMetersSum);
          setTrends({
            distance: {
              rowErg: localDistanceTrendsRow,
              bikeErg: localDistanceTrendsBike,
              skiErg: localDistanceTrendsSki,
            },
            pace: {
              rowErg: localPaceTrendsRow,
              bikeErg: localPaceTrendsBike,
              skiErg: localPaceTrendsSki,
            },
            time: {
              rowErg: localWorkTimeTrendsRow,
              bikeErg: localWorkTimeTrendsBike,
              skiErg: localWorkTimeTrendsSki,
            },
          });

          setUnfilteredRowData(combinedUnfilteredRowData);
        },
      });
    } else {
      console.log("No file");
    }
  };

  const UploadFile = () => (
    <form onSubmit={handleFormSubmit}>
      <Flex
        className="upload-file pad-bottom pad-right"
        mih={90}
        gap="md"
        justify="flex-start"
        align="flex-end"
        direction="row"
        wrap="wrap"
      >
        <FileInput
          label="Upload Concept2 CSV data"
          description="Download from official site"
          placeholder={file ? file["name"] : "Click to choose .csv file"}
          accept="csv"
          onChange={handleCSVInput}
          clearable
        />
        <Button type={"submit"} disabled={!file}>
          Upload
        </Button>
      </Flex>
    </form>
  );

  return (
    <MantineProvider defaultColorScheme="dark">
      <div className={"app-container"}>
        <Grid className={"pad-left pad-right"}>
          <Grid.Col span={12}>
            <div className={"app-title"}>
              <h2>C2 Erg Bests</h2>
            </div>
            <UploadFile />
            <Divider />

            <div className={"pad-top pad-bottom"}>
              <Radio
                className={"pad-bottom"}
                label={"Calendar year (Jan-Dec)"}
                checked={true}
                disabled
              />
              <Radio
                className={"pad-bottom"}
                label={"Concept2 season (May-April)"}
                checked={false}
                disabled
              />
              <Radio label={"Last 12 months"} checked={false} disabled />
            </div>

            {unfilteredRowData.length === 0 && (
              <p>Upload your 'concept2-season-2024.csv' from the erg site</p>
            )}
            {unfilteredRowData.length > 0 && (
              <div>
                <div>
                  You completed {unfilteredRowData.length} sessions in 2024 🥇
                </div>
                <div>
                  You completed {getFormattedDistanceString(totalMeters, false)}{" "}
                  meters this calendar year!
                </div>
              </div>
            )}

            <ErgProportions workDistanceSums={workDistanceSums} />

            {/** Month cards **/}
            {isDoneLoading ? <MonthCards bests={bests} /> : <>Loading...</>}

            {/** Trend charts **/}
            <br />
            {trends !== undefined && <TrendsComponent trends={trends} />}

            {/** AG-grid table with workout details **/}
            <WorkoutTableComponent unfilteredRowData={unfilteredRowData} />
          </Grid.Col>
        </Grid>
      </div>

      <div className={"bottom-credits"}>App by Mandi Burley, 2024</div>
    </MantineProvider>
  );
}

export default App;
