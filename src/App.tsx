import {useState, useEffect, FormEvent} from 'react';
import './App.css'
import '@mantine/core/styles.css';
import {Divider, FileInput, MantineProvider} from '@mantine/core';
import { Grid, Button, Flex } from '@mantine/core';

import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import Papa, {ParseResult} from 'papaparse';
import _ from 'lodash';
import {
  getDayOfMonth,
  getFormattedDate,
  getFormattedDistance,
  getFormattedDuration,
  getFormattedTime,
  getMonthNumber, getNumberWithCommas, getRowYear, parseTimeToMilliseconds
} from "./services/formatting_utils";
import {MonthCards} from "./components/BestsByMonth/MonthCards.tsx";
import {
  BestDataForErgIF,
  ErgType,
  ParsedCSVRowDataIF,
  DateAndDistanceIF,
  DateAndPaceIF, LocalBests, TrendsDataIF
} from "./types/types.ts";
import {TrendsComponent} from "./components/TrendCharts/Trends.component.tsx";
import {WorkoutTableComponent} from "./components/WorkoutTable/WorkoutTable.component.tsx";

const csvFiles = ['/concept2-season-2024.csv', '/concept2-season-2025.csv'];
const TEST_MODE = true;

const DEFAULT_RECORD_DATA: BestDataForErgIF = {
  bestDistance: {
    value: 0,
    date: '',
    workoutId: '',
  },
  bestPace: {
    value: '999:00.0',
    date: '',
    workoutId: '',
  },
  bestStroke: {
    value: 0,
    date: '',
    workoutId: '',
  },
};

function App() {
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;

  const [isDoneLoading, setIsDoneLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [hasRowErg, setHasRowErg] = useState(false);
  const [hasBikeErg, setHasBikeErg] = useState(false);
  const [hasSkiErg, setHasSkiErg] = useState(false);

  const [unfilteredRowData, setUnfilteredRowData] = useState<ParsedCSVRowDataIF[]>([]);
  const [bests, setBests] = useState({});
  const [trends, setTrends] = useState<TrendsDataIF | undefined>(undefined);

  useEffect(() => {
    if (TEST_MODE) { // use sample data (my own) to populate the page
      const fetchData = async () => {
        const filePromises = _.map(csvFiles, (fileName) =>
          fetchLocalCSVFile(fileName)
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
  }

  const handleCSVInput = (payload: File | null) => {
    setFile(payload);
  }

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    parseCSVIntoChartData(file);
  }

  const localDistanceTrendsRow: DateAndDistanceIF[] = [];
  const localPaceTrendsRow: DateAndPaceIF[] = [];

  const localDistanceTrendsBike: DateAndDistanceIF[] = [];
  const localPaceTrendsBike: DateAndPaceIF[] = [];

  const localDistanceTrendsSki: DateAndDistanceIF[] = [];
  const localPaceTrendsSki: DateAndPaceIF[] = [];

  const combinedUnfilteredRowData: ParsedCSVRowDataIF[] = [];
  const localBests: LocalBests = {};

  const parseCSVIntoChartData = (file: File | null) => {
    if (file) {
      Papa.parse(file, {
        complete: function (results: ParseResult<string[]>) {
          results.data.shift();

          // get all the row data line by line from the csv
          _.chain(results.data)
            .filter((row: (string | number)[]) => row.length > 1)
            .orderBy((row: (string | number)[]) => row[1]) // date
            .map((row: (string | number)[]) => {
              const ergType = String(row[19]).charAt(0).toLowerCase() + String(row[19]).slice(1) as "bikeErg" | "rowErg" | "skiErg";

              // rowData from the CSV
              const parsedCSVRowData: ParsedCSVRowDataIF = {
                dateRaw: String(row[1]),
                date: getFormattedDate(String(row[1])),
                day: getDayOfMonth(String(row[1])),
                startTime: getFormattedTime(String(row[1])),
                type: ergType as ErgType,
                description: String(row[2]),
                pace: String(row[11]), // example: 2:37.4
                workTime: getFormattedDuration(Number(row[4])),
                restTime: getFormattedDuration(Number(row[6])),
                workDistance: getFormattedDistance(row[7] as string),
                restDistance: getFormattedDistance(row[8] as string),
                strokeRate: Number(row[9]),
                strokeCount: Number(row[10]),
                totalCal: `${row[14]} (${row[13]} cal/hr)`,
                avgHeartRate: Number(row[15]),
                dragFactor: Number(row[16]),
                ranked: Boolean(row[20]),
                id: String(row[0]),
              }

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
                  rowErgDates: _.fill(Array(32), undefined),
                  bikeErgDates: _.fill(Array(32), undefined),
                  skiErgDates: _.fill(Array(32), undefined),
                } as const;
              }

              const localErgType = localBests?.[monthName]?.[ergType];
              if (localErgType) {
                // Update best distance, if better
                if (parsedCSVRowData.workDistance > Number(localErgType.bestDistance.value ?? 0)) {
                  localErgType.bestDistance.value = parsedCSVRowData.workDistance;
                  localErgType.bestDistance.date = parsedCSVRowData.date;
                  localErgType.bestDistance.workoutId = parsedCSVRowData.id;
                }

                  // Update best pace, if better
                  if (parseTimeToMilliseconds(parsedCSVRowData.pace) < parseTimeToMilliseconds(String(localErgType.bestPace.value))) {
                    localErgType.bestPace.value = parsedCSVRowData.pace;
                    localErgType.bestPace.date = parsedCSVRowData.date;
                    localErgType.bestPace.workoutId = parsedCSVRowData.id;
                  }

                  // Update best strokeRate, if better
                  if (parsedCSVRowData.strokeRate > Number(localErgType.bestStroke.value)) {
                    localErgType.bestStroke.value = parsedCSVRowData.strokeRate;
                    localErgType.bestStroke.date = parsedCSVRowData.date;
                    localErgType.bestStroke.workoutId = parsedCSVRowData.id;
                  }
                }

              // add to "distanceTrends" object
              const newDistance: { date: string, distance: number } = {
                date: parsedCSVRowData.date,
                distance: parsedCSVRowData.workDistance,
              }
              // add to "paceTrends" object
              const newPace: { date: string, pace: number } = {
                date: parsedCSVRowData.date,
                pace: parseTimeToMilliseconds(parsedCSVRowData.pace),
              }

              // increment workout count
              const best = localBests[monthName];

              if (ergType === 'rowErg') {
                setHasRowErg(true);
                localDistanceTrendsRow.push(newDistance);
                localPaceTrendsRow.push(newPace);
                if (best?.rowErgCount !== undefined) {
                  best.rowErgCount = best.rowErgCount + 1;
                  best.rowErgDates[parsedCSVRowData.day] = {
                    date: parsedCSVRowData.date,
                    ergType: 'RowErg',
                    distance: getNumberWithCommas(parsedCSVRowData.workDistance),
                    time: String(parsedCSVRowData.workTime),
                  };
                }
              } else if (ergType === 'bikeErg') {
                setHasBikeErg(true);
                localDistanceTrendsBike.push(newDistance);
                localPaceTrendsBike.push(newPace);
                if (best?.bikeErgCount !== undefined) {
                  best.bikeErgCount = best.bikeErgCount + 1;
                  best.bikeErgDates[parsedCSVRowData.day] = {
                    date: parsedCSVRowData.date,
                    ergType: 'RowErg',
                    distance: getNumberWithCommas(parsedCSVRowData.workDistance),
                    time: String(parsedCSVRowData.workTime),
                  };
                }
              } else if (ergType === 'skiErg') {
                setHasSkiErg(true);
                localDistanceTrendsSki.push(newDistance);
                localPaceTrendsSki.push(newPace);
                if (best?.skiErgCount !== undefined) {
                  best.skiErgCount = best.skiErgCount + 1;
                  best.skiErgDates[parsedCSVRowData.day] = {
                    date: parsedCSVRowData.date,
                    ergType: 'RowErg',
                    distance: getNumberWithCommas(parsedCSVRowData.workDistance),
                    time: String(parsedCSVRowData.workTime),
                  };
                }
              } else {
                console.log("Unsupported erg type found")
              }

                combinedUnfilteredRowData.push(parsedCSVRowData);
                return parsedCSVRowData;
              }).value();

          setBests(localBests);
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
            }
          })

          setUnfilteredRowData(combinedUnfilteredRowData);
        }
      });
    } else {
      console.log("No file")
    }
  }

  const UploadFile = () => (
    <form onSubmit={handleFormSubmit}>
      <Flex
        className="upload-file pad-bottom pad-right"
        mih={90}
        gap="md"
        justify="flex-start"
        align="flex-end"
        direction="row"
        wrap="wrap">
        <FileInput
          label="Upload Concept2 CSV data"
          description="Download from official site"
          placeholder={file ? file['name'] : "Click to choose .csv file"}
          accept="csv"
          onChange={handleCSVInput}
          clearable
        />
        <Button type={"submit"} disabled={!file}>Upload</Button>
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
            <UploadFile/>
            <Divider/>

            {unfilteredRowData.length === 0 && <p>Upload your 'concept2-season-2024.csv' from the erg site</p>}
            {unfilteredRowData.length > 0 && <p>You completed {unfilteredRowData.length} workouts this calendar year 🥇</p>}

            {/** Month cards **/}
            {isDoneLoading ? <MonthCards bests={bests} hasRowErg={hasRowErg}
                                         hasBikeErg={hasBikeErg}
                                         hasSkiErg={hasSkiErg}/> : <>Loading...</>}

            {/** Trend charts **/}
            <br/>
            {trends !== undefined && <TrendsComponent
              hasRowErg={hasRowErg}
              hasBikeErg={hasBikeErg}
              hasSkiErg={hasSkiErg}
              trends={trends}
            />}

            {/** AG-grid table with workout details **/}
            <WorkoutTableComponent
                hasRowErg={hasRowErg}
                hasBikeErg={hasBikeErg}
                hasSkiErg={hasSkiErg}
                unfilteredRowData={unfilteredRowData}/>

            </Grid.Col>
          </Grid>
        </div>

      <div className={"bottom-credits"}>
        App by Mandi Burley, 2024
      </div>
    </MantineProvider>
  )
}

export default App
