import { useState, FormEvent } from "react";
import "./App.css";
import "@mantine/core/styles.css";
import {
  CloseButton,
  Text,
  FileInput,
  Group,
  MantineProvider,
  Radio,
  Select,
  Stack,
  Container,
} from "@mantine/core";
import { Grid, Button, Flex } from "@mantine/core";

import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import Papa, { ParseResult } from "papaparse";
import _ from "lodash";
import {
  getDateSinceEpoch,
  getDayOfMonth,
  getFormattedDistance,
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
  TrendDataGroupedIF,
  ViewMode,
  GeneralStatDataIF,
} from "./types/types.ts";
import { TrendsComponent } from "./components/TrendCharts/Trends.component.tsx";
import { useDispatch, useSelector } from "react-redux";
import {
  setHasBikeErg,
  setHasRowErg,
  setHasSkiErg,
  setIsDoneLoadingCSVData,
  setViewingYear,
} from "./store/ergDataSlice";
import ErgProportions from "./components/ErgProportionsMeter/ErgProportions.component.tsx";
import GeneralStats from "./components/GeneralStatsForYear/GeneralStats.component.tsx";
import { RootState } from "./store/store.ts";
import { RIDICULOUS_FUTURE_TIMESTAMP } from "./consts/consts.ts";

const localCSVFiles = [
  "/concept2-season-2024.csv",
  "/concept2-season-2025.csv",
];

const DEFAULT_RECORD_DATA: BestDataForErgIF = {
  bestDistance: {
    value: 0,
    date: 0,
    workoutId: "",
  },
  bestPace: {
    value: "999:00.0",
    date: 0,
    workoutId: "",
  },
  bestStroke: {
    value: 0,
    date: 0,
    workoutId: "",
  },
  bestWorkTime: {
    value: 0,
    date: 0,
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
  const ergDataState = useSelector((state: RootState) => state.ergData);

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

  const [files, setFiles] = useState<File[] | null>(null);
  const [years, setYears] = useState<string[]>([]);
  const [calendarViewMode, setCalendarViewMode] =
    useState<ViewMode>("calendarYear");

  const [unfilteredRowData, setUnfilteredRowData] = useState<
    ParsedCSVRowDataIF[]
  >([]);
  const [bests, setBests] = useState({});
  const [trends, setTrends] = useState<TrendsDataIF | undefined>(undefined);
  const [generalStatData, setGeneralStatData] = useState<GeneralStatDataIF>({
    totalMeters: 0,
    totalErgTime: 0,
    earliestDate: RIDICULOUS_FUTURE_TIMESTAMP,
    latestDate: -1,
    years: [],
  });

  const removeSelectedFilename = (filename: string) => {
    if (files) {
      const updatedFiles = files.filter((f) => f.name !== filename);
      setFiles(updatedFiles);
    }
  };

  const SelectedFilenames = (
    <>
      {files && files?.length > 0 && (
        <div>
          <p className={"font-size-14"}>
            {files.length} {files.length === 1 ? "file" : "files"}:
          </p>
          <ul>
            {files.map((file) => (
              <li key={file.name} className={"font-size-14 filename-in-list"}>
                {file.name}{" "}
                {!ergDataState.isDoneLoadingCSVData && (
                  <CloseButton
                    size="sm"
                    className={"remove-filename-x"}
                    onClick={() => removeSelectedFilename(file.name)}
                  ></CloseButton>
                )}
                {ergDataState.isDoneLoadingCSVData && <span>✔</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );

  const groupTrendDataByMonth = (
    data: DateAndDistanceIF[] | DateAndPaceIF[] | DateAndWorkTimeIF[],
    stat: "distance" | "pace" | "workTime",
    ergType: ErgType,
  ): TrendDataGroupedIF[] => {
    const grouped = _.groupBy(data, "month");
    const allMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    if (stat === "distance") {
      return allMonths.map((month) => ({
        month: month,
        value: grouped[month] ? _.sumBy(grouped[month], stat) : 0, // default to 0 if month has no data
        ergType: ergType,
        stat: "distance",
      }));
    } else if (stat === "pace") {
      // sum the paces and average them (the average pace for January was xx:yy)
      return allMonths.map((month) => {
        const items = grouped[month] || []; // Get the grouped items for the month or an empty array
        const total = _.sumBy(items, stat); // Sum the `pace` values
        const count = items.length; // Count the number of items for the month
        const average = count > 0 ? total / count : 0; // Calculate the average or default to 0

        return {
          month: month,
          value: average,
          ergType: ergType,
          stat: "pace",
        };
      });
    } else {
      return allMonths.map((month) => ({
        month: month,
        value: 0,
        ergType: ergType,
        stat: "distance",
      }));
    }
  };

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

  const loadTestData = async () => {
    const filePromises = _.map(localCSVFiles, (fileName) =>
      fetchLocalCSVFile(fileName),
    );

    const localFiles = await Promise.all(filePromises);
    parseCSVFiles(localFiles);
  };

  const handleCSVInput = (payload: File[] | null) => {
    setFiles(payload);
    dispatch(setIsDoneLoadingCSVData(false));
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (files) {
      parseCSVFiles(files);
    }
  };

  const handleToggleCalendarViewMode = (mode: ViewMode) => {
    setCalendarViewMode(mode);
  };

  const handleSelectYear = (year: string) => {
    dispatch(setViewingYear(year));
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
  let localErgTimeSum = 0;
  let localEarliestDate = RIDICULOUS_FUTURE_TIMESTAMP;
  let localLatestDate = 0;

  const parseCSVFiles = (files: (File | null)[]) => {
    const localYears: string[] = [];
    if (files) {
      files.forEach((file) => {
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
                    String(row[19]).slice(1)) as
                    | "bikeErg"
                    | "rowErg"
                    | "skiErg";
                  // row data from the CSV ("row" as in table rows, not RowErg)
                  const parsedCSVRowData: ParsedCSVRowDataIF = {
                    date: getDateSinceEpoch(String(row[1])),
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

                  // update earliest and latest date, if applicable
                  if (parsedCSVRowData.date < localEarliestDate) {
                    localEarliestDate = parsedCSVRowData.date;
                  }
                  if (parsedCSVRowData.date > localLatestDate) {
                    localLatestDate = parsedCSVRowData.date;
                  }

                  // add this year to Years if we don't have it already
                  const thisYear = String(getRowYear(parsedCSVRowData.date));
                  if (!localYears.includes(thisYear)) {
                    localYears.push(thisYear);
                  }

                  // add these meters to the sum for this date
                  localMetersSum +=
                    parsedCSVRowData.workDistance +
                    parsedCSVRowData.restDistance;

                  localErgTimeSum +=
                    Number(parsedCSVRowData.workTime) +
                    Number(parsedCSVRowData.restTime);

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
                      parseTimeToMilliseconds(
                        String(localErgType.bestPace.value),
                      )
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
                      localErgType.bestStroke.value =
                        parsedCSVRowData.strokeRate;
                      localErgType.bestStroke.date = parsedCSVRowData.date;
                      localErgType.bestStroke.workoutId = parsedCSVRowData.id;
                    }

                    // Update best workTime, if better
                    if (
                      Number(parsedCSVRowData.workTime) >
                      Number(localErgType.bestWorkTime.value)
                    ) {
                      localErgType.bestWorkTime.value =
                        parsedCSVRowData.workTime;
                      localErgType.bestWorkTime.date = parsedCSVRowData.date;
                      localErgType.bestWorkTime.workoutId = parsedCSVRowData.id;
                    }
                  }

                  /**
                   * Multiple workouts of the same type in the same day are aggregated
                   * for the sake of calculating day-over-day trends
                   **/
                  const newDistance: DateAndDistanceIF = {
                    date: parsedCSVRowData.date,
                    distance:
                      parsedCSVRowData.workDistance +
                      parsedCSVRowData.restDistance,
                    month: getMonthNumber(parsedCSVRowData.date),
                  };
                  const newPace: DateAndPaceIF = {
                    date: parsedCSVRowData.date,
                    pace: parseTimeToMilliseconds(parsedCSVRowData.pace),
                    month: getMonthNumber(parsedCSVRowData.date),
                  };
                  const newWorkTime: DateAndWorkTimeIF = {
                    date: parsedCSVRowData.date,
                    workTime: parsedCSVRowData.workTime,
                    month: getMonthNumber(parsedCSVRowData.date),
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
                      month.rowErgSessionsByDayOfMonth[
                        parsedCSVRowData.day
                      ].push(newSession);

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
                      month.bikeErgSessionsByDayOfMonth[
                        parsedCSVRowData.day
                      ].push(newSession);

                      month.bikeErg.workDistanceSum =
                        month.bikeErg.workDistanceSum +
                        parsedCSVRowData.workDistance;
                      month.bikeErg.workTimeSum =
                        month.bikeErg.workTimeSum + parsedCSVRowData.workTime;
                      workDistanceSums.bikeErg =
                        workDistanceSums.bikeErg +
                        parsedCSVRowData.workDistance;
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
                      month.skiErgSessionsByDayOfMonth[
                        parsedCSVRowData.day
                      ].push(newSession);

                      month.skiErg.workDistanceSum =
                        month.skiErg.workDistanceSum +
                        parsedCSVRowData.workDistance;
                      month.skiErg.workTimeSum =
                        month.skiErg.workTimeSum + parsedCSVRowData.workTime;
                      workDistanceSums.skiErg =
                        workDistanceSums.skiErg + parsedCSVRowData.workDistance;
                    }
                  } else {
                    console.log("Unsupported erg type found: " + ergType);
                  }

                  combinedUnfilteredRowData.push(parsedCSVRowData);
                  return parsedCSVRowData;
                })
                .value();

              setBests(localBests);

              setTrends({
                distance: {
                  rowErg: groupTrendDataByMonth(
                    localDistanceTrendsRow,
                    "distance",
                    "rowErg",
                  ),
                  bikeErg: groupTrendDataByMonth(
                    localDistanceTrendsBike,
                    "distance",
                    "bikeErg",
                  ),
                  skiErg: groupTrendDataByMonth(
                    localDistanceTrendsSki,
                    "distance",
                    "skiErg",
                  ),
                },
                pace: {
                  rowErg: groupTrendDataByMonth(
                    localPaceTrendsRow,
                    "pace",
                    "rowErg",
                  ),
                  bikeErg: groupTrendDataByMonth(
                    localPaceTrendsBike,
                    "pace",
                    "bikeErg",
                  ),
                  skiErg: groupTrendDataByMonth(
                    localPaceTrendsSki,
                    "pace",
                    "skiErg",
                  ),
                },
                time: {
                  rowErg: groupTrendDataByMonth(
                    localWorkTimeTrendsRow,
                    "workTime",
                    "rowErg",
                  ),
                  bikeErg: groupTrendDataByMonth(
                    localWorkTimeTrendsBike,
                    "workTime",
                    "bikeErg",
                  ),
                  skiErg: groupTrendDataByMonth(
                    localWorkTimeTrendsSki,
                    "workTime",
                    "skiErg",
                  ),
                },
              });

              setGeneralStatData({
                totalMeters: localMetersSum,
                totalErgTime: localErgTimeSum,
                earliestDate: localEarliestDate,
                latestDate: localLatestDate,
                years: localYears,
              });
              setYears(localYears);
              setUnfilteredRowData(combinedUnfilteredRowData);
            },
          });
        }
      });
    }
    dispatch(setIsDoneLoadingCSVData(true));
  };

  const AdjustViewSettings = () => (
    <div>
      <Radio.Group
        label="View options"
        onChange={(value: string) =>
          handleToggleCalendarViewMode(value as ViewMode)
        }
        description={"View data by calendar year or Concept2 season"}
        value={calendarViewMode}
      >
        <Stack>
          {/* Calendar year radio + select */}
          <Radio.Card className={"radio-card"} value={"calendarYear"}>
            <Group wrap={"nowrap"}>
              <Radio.Indicator />
              <div>
                <Text className="radio-title">Calendar year (Jan-Dec)</Text>
                <Text className="radio-description">
                  Requires at least 2 .csv files
                </Text>
              </div>

              <div className={"radio-column-select"}>
                {years && (
                  <div>
                    <Select
                      value={years[0]}
                      disabled={calendarViewMode != "calendarYear"}
                      data={years.map((year) => String(year))}
                      onChange={() => handleSelectYear}
                    ></Select>
                  </div>
                )}
              </div>
            </Group>
          </Radio.Card>

          {/* Concept2 season radio */}
          <Radio.Card
            value={"concept2Season"}
            disabled={true}
            className={"radio-card"}
          >
            <Group wrap={"nowrap"}>
              <Radio.Indicator />
              <div>
                <Text className="radio-title">
                  Concept2 season (May-April) [COMING SOON]
                </Text>
              </div>
            </Group>
          </Radio.Card>
        </Stack>
      </Radio.Group>
    </div>
  );

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
          label="Select Concept2 .csv file(s)"
          description="Find your season data files at https://log.concept2.com/history"
          placeholder={"concept2-season-YEAR.csv"}
          accept="csv"
          onChange={handleCSVInput}
          multiple
          clearable
        />
      </Flex>
      <Flex
        className="upload-file pad-bottom pad-right"
        gap="md"
        justify="flex-start"
        align="flex-start"
        direction="column"
        wrap="wrap"
      >
        {files && SelectedFilenames}
        <div className={"process-data-buttons"}>
          <Button
            type={"submit"}
            disabled={ergDataState.isDoneLoadingCSVData || !files?.length}
          >
            Process .csv data
          </Button>

          <Button className={"load-test-data-button"} onClick={loadTestData}>
            Load my test data
          </Button>
        </div>
      </Flex>
    </form>
  );

  const GeneralTrends = () => (
    <div>
      <h2
        className={`${ergDataState.isDoneLoadingCSVData ? "" : "unloaded-text"}`}
      >
        Your Erg Trends {ergDataState.viewingYear}
      </h2>
      <div>{trends !== undefined && <TrendsComponent trends={trends} />}</div>
    </div>
  );

  return (
    <MantineProvider defaultColorScheme="dark">
      <Container className={"everything-except-footer"} fluid={true}>
        <div>
          {/* App title */}
          <Grid>
            <Grid.Col span={12}>
              <h2 className={"app-title"}>C2 Erg Bests</h2>
            </Grid.Col>
          </Grid>

          {/* Upload, View Options side-by-side */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 5 }}>
              <div className={"dashed-border"}>
                <UploadFile />
              </div>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <AdjustViewSettings />
            </Grid.Col>
          </Grid>

          {/* General Stats */}
          <Grid>
            <Grid.Col span={{ base: 12, sm: 5 }}>
              <GeneralStats
                fileCount={files?.length ?? 0}
                sessionsCount={unfilteredRowData.length}
                data={generalStatData}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 7 }}>
              <GeneralTrends />
            </Grid.Col>
          </Grid>

          {/* Proportions bar */}
          <Grid>
            <div className={"proportions-bar-container"}>
              <ErgProportions workDistanceSums={workDistanceSums} />
            </div>
          </Grid>

          {/* Month cards */}
          <Grid grow>
            <Grid.Col span={12}>
              <MonthCards bests={bests} />
            </Grid.Col>
          </Grid>

          {/** AG-grid table with workout details - removed 12/30, it's not very useful **/}
          {/** <WorkoutTableComponent unfilteredRowData={unfilteredRowData} /> **/}
        </div>
        <div className={"bottom-credits"}>App by Mandi Burley, 2024-2025</div>
      </Container>
    </MantineProvider>
  );
}

export default App;
