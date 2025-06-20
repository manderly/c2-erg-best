import { useState, FormEvent, useEffect } from "react";
import "./App.css";
import "@mantine/core/styles.css";
import {
  CloseButton,
  FileInput,
  MantineProvider,
  Select,
  Container,
  Divider,
} from "@mantine/core";
import { Grid, Button, Flex } from "@mantine/core";

import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import Papa, { ParseResult } from "papaparse";
import _ from "lodash";
import {
  getErgTypeFromRow,
  getMonthNumber,
  getRowData,
  getRowYear,
  parseTimeToMilliseconds,
} from "./services/formatting_utils";
import { MonthCards } from "./components/BestsByMonth/MonthCards.tsx";
import {
  MonthSummaryForErgIF,
  ParsedCSVRowDataIF,
  ErgDataByYear,
  WorkDistanceSumsIF,
  SessionDataIF,
  AllTimeSumsDataIF,
  csvRow,
  ErgDataIF,
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
import { englishMonths, RIDICULOUS_FUTURE_TIMESTAMP } from "./consts/consts.ts";
import YearOrSeasonStats from "./components/GeneralStatsForYear/YearOrSeasonStats.tsx";

const localCSVFiles = [
  "/concept2-season-2024.csv",
  "/concept2-season-2025.csv",
  "/concept2-season-2026.csv",
];

const DEFAULT_RECORD_DATA: MonthSummaryForErgIF = {
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
  bestWattsAvg: {
    value: 0,
    date: 0,
    workoutId: "",
  },
  workDistanceSum: 0,
  restDistanceSum: 0,
  workTimeSum: 0,
  restTimeSum: 0,
  sessionCount: 0,
};

const workDistanceSums: WorkDistanceSumsIF = {
  rowErg: 0,
  bikeErg: 0,
  skiErg: 0,
};

function App() {
  const dispatch = useDispatch();
  const ergDataState = useSelector((state: RootState) => state.ergData);

  const [files, setFiles] = useState<File[] | null>(null);
  const [years, setYears] = useState<string[]>([]);

  const [unfilteredRowData, setUnfilteredRowData] = useState<
    ParsedCSVRowDataIF[]
  >([]);

  const [ergData, setErgData] = useState<ErgDataIF>({
    ergDataByYear: {} as ErgDataByYear,
    allTimeSums: {} as AllTimeSumsDataIF,
    years: [],
  });

  /* On page load, load my test data (for demo purposes) */
  useEffect(() => {
    loadTestData();
  }, []);

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

  const getSessionData = (parsedCSVRow: ParsedCSVRowDataIF) => {
    return {
      date: parsedCSVRow.date,
      ergType: parsedCSVRow.type,
      distance: parsedCSVRow.workDistance,
      time: String(parsedCSVRow.workTime),
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

  const handleSelectYear = (year: string | null) => {
    if (year) {
      dispatch(setViewingYear(year));
    }
  };

  const combinedUnfilteredRowData: ParsedCSVRowDataIF[] = [];

  // Build an object that conforms to the established type, then set its state variable
  // once all data is done processing
  const localErgDataByYear: ErgDataByYear = {};

  let localMetersSum = 0;
  let localErgTimeSum = 0;
  let localEarliestDate = RIDICULOUS_FUTURE_TIMESTAMP;
  let localLatestDate = 0;
  let localRowMetersSum = 0;
  let localBikeMetersSum = 0;
  let localSkiMetersSum = 0;

  const buildEmptyMonth = (localMonth: string, localYear: string) => {
    return {
      name: localMonth,
      year: Number(localYear),
      rowErg: _.cloneDeep(DEFAULT_RECORD_DATA),
      bikeErg: _.cloneDeep(DEFAULT_RECORD_DATA),
      skiErg: _.cloneDeep(DEFAULT_RECORD_DATA),
      rowErgSessionsByDayOfMonth: [...Array(32)].map((): SessionDataIF[] => []),
      bikeErgSessionsByDayOfMonth: [...Array(32)].map(
        (): SessionDataIF[] => [],
      ),
      skiErgSessionsByDayOfMonth: [...Array(32)].map((): SessionDataIF[] => []),
      metersAll: 0,
    };
  };

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
                .filter((row: csvRow) => row.length > 1)
                .orderBy((row: csvRow) => row[1]) // date
                .map((row: csvRow) => {
                  // extract data from csv row
                  const parsedCSVRow: ParsedCSVRowDataIF = getRowData(row);
                  const ergType = getErgTypeFromRow(row);

                  // update earliest and latest date, if applicable
                  if (parsedCSVRow.date < localEarliestDate) {
                    localEarliestDate = parsedCSVRow.date;
                  }
                  if (parsedCSVRow.date > localLatestDate) {
                    localLatestDate = parsedCSVRow.date;
                  }

                  // add this year to years if we don't have it already
                  const localYear = String(getRowYear(parsedCSVRow.date));
                  if (!localYears.includes(localYear)) {
                    localYears.push(localYear);
                  }

                  // add these meters to the sum
                  localMetersSum +=
                    parsedCSVRow.workDistance + parsedCSVRow.restDistance;
                  localErgTimeSum +=
                    Number(parsedCSVRow.workTime) +
                    Number(parsedCSVRow.restTime);

                  // there is no data for this year, create the year and populate it
                  if (localErgDataByYear[localYear] === undefined) {
                    localErgDataByYear[localYear] = {};
                    englishMonths.map((month) => {
                      localErgDataByYear[localYear][month] = _.cloneDeep(
                        buildEmptyMonth(month, localYear),
                      );
                    });
                  }

                  // build "bests" data object for this particular machine
                  const monthIdx = getMonthNumber(parsedCSVRow.date) - 1;
                  const monthName = englishMonths[monthIdx];
                  const ergMachineData =
                    localErgDataByYear?.[localYear]?.[monthName]?.[ergType];
                  if (ergMachineData) {
                    // Update best distance, if better
                    if (
                      parsedCSVRow.workDistance >
                      Number(ergMachineData.bestDistance.value ?? 0)
                    ) {
                      ergMachineData.bestDistance.value =
                        parsedCSVRow.workDistance;
                      ergMachineData.bestDistance.date = parsedCSVRow.date;
                      ergMachineData.bestDistance.workoutId = parsedCSVRow.id;
                    }

                    // Update best pace, if better
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

                    // Update best strokeRate, if better
                    if (
                      parsedCSVRow.strokeRate >
                      Number(ergMachineData.bestStroke.value)
                    ) {
                      ergMachineData.bestStroke.value = parsedCSVRow.strokeRate;
                      ergMachineData.bestStroke.date = parsedCSVRow.date;
                      ergMachineData.bestStroke.workoutId = parsedCSVRow.id;
                    }

                    // Update best workTime, if better
                    if (
                      Number(parsedCSVRow.workTime) >
                      Number(ergMachineData.bestWorkTime.value)
                    ) {
                      ergMachineData.bestWorkTime.value = parsedCSVRow.workTime;
                      ergMachineData.bestWorkTime.date = parsedCSVRow.date;
                      ergMachineData.bestWorkTime.workoutId = parsedCSVRow.id;
                    }

                    // Update best watts, if better
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
                  workDistanceSums[ergType] += parsedCSVRow.workDistance;

                  if (ergType === "rowErg") {
                    dispatch(setHasRowErg());
                    // push new entry to the correct day of the month array
                    const newSession = getSessionData(parsedCSVRow);
                    month.rowErgSessionsByDayOfMonth[parsedCSVRow.day].push(
                      newSession,
                    );
                    localRowMetersSum +=
                      parsedCSVRow.workDistance + parsedCSVRow.restDistance;
                  } else if (ergType === "bikeErg") {
                    dispatch(setHasBikeErg());

                    // push new entry to the correct day of the month array
                    const newSession = getSessionData(parsedCSVRow);
                    month.bikeErgSessionsByDayOfMonth[parsedCSVRow.day].push(
                      newSession,
                    );
                    localBikeMetersSum +=
                      parsedCSVRow.workDistance + parsedCSVRow.restDistance;
                  } else if (ergType === "skiErg") {
                    dispatch(setHasSkiErg());
                    month["skiErg"].sessionCount += 1;

                    // push new entry to the correct day of the month array
                    const newSession = getSessionData(parsedCSVRow);
                    month.skiErgSessionsByDayOfMonth[parsedCSVRow.day].push(
                      newSession,
                    );
                    localSkiMetersSum +=
                      parsedCSVRow.workDistance + parsedCSVRow.restDistance;
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
              setErgData(tempErgData);
              setYears(localYears);
              setUnfilteredRowData(combinedUnfilteredRowData);
            },
          });
        }
      });
    }
    dispatch(setIsDoneLoadingCSVData(true));
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
        Your Erg Meters for {ergDataState.viewingYear}
      </h2>
      <div>
        <TrendsComponent data={ergData.ergDataByYear} />
      </div>
    </div>
  );

  return (
    <MantineProvider defaultColorScheme="dark">
      <Container className={"title-container"} fluid={true}>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 12 }}>
            <h2 className={"app-title"}>C2 Erg Bests</h2>
          </Grid.Col>
        </Grid>
        <Grid>
          <Grid.Col span={{ base: 4 }}>
            <div className={"dashed-border"}>
              <UploadFile />
            </div>
          </Grid.Col>
          <Grid.Col span={{ base: 8 }}></Grid.Col>
        </Grid>
      </Container>

      <Container className={"everything-except-footer"} fluid={true}>
        <div className={"pad-top-subtle"}>
          {/* General Stats */}
          <Grid>
            <Grid.Col span={{ base: 12 }}>
              <GeneralStats
                sessionsCount={unfilteredRowData.length}
                ergData={ergData}
              />
            </Grid.Col>
          </Grid>

          {/* Proportions bar */}
          <Grid>
            <Grid.Col span={{ base: 12 }}>
              <ErgProportions workDistanceSums={workDistanceSums} />
            </Grid.Col>
          </Grid>
          <Divider />

          <Grid>
            <Grid.Col span={{ base: 1.5 }}>
              {years && (
                <div className={"pad-top-subtle"}>
                  <Select
                    value={ergDataState.viewingYear}
                    disabled={false}
                    data={years.map((year) => String(year))}
                    onChange={(year) => handleSelectYear(year)}
                  ></Select>
                </div>
              )}
            </Grid.Col>
            <Grid.Col span={{ base: 10.5 }}></Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 5 }}>
              <YearOrSeasonStats data={ergData.ergDataByYear} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 7 }}>
              <GeneralTrends />
            </Grid.Col>
          </Grid>

          {/* Month cards */}
          <Grid grow>
            <Grid.Col span={12}>
              <MonthCards data={ergData.ergDataByYear} />
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
