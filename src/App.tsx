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
import _ from "lodash";
import { MonthCards } from "./components/BestsByMonth/MonthCards.tsx";
import {
  ParsedCSVRowDataIF,
  ErgDataByYear,
  WorkDistanceSumsIF,
  AllTimeSumsDataIF,
  ErgDataIF,
  MonthDataIF,
} from "./types/types.ts";
import { TrendsComponent } from "./components/TrendCharts/Trends.component.tsx";
import { useDispatch, useSelector } from "react-redux";
import { setIsDoneLoadingCSVData, setViewingYear } from "./store/ergDataSlice";
import ErgProportions from "./components/ErgProportionsMeter/ErgProportions.component.tsx";
import GeneralStats from "./components/GeneralStatsForYear/GeneralStats.component.tsx";
import { RootState } from "./store/store.ts";
import YearOrSeasonStats from "./components/GeneralStatsForYear/YearOrSeasonStats.tsx";
import { fetchLocalCSVFile, parseCSVFiles } from "./services/csvService";
import MonthData from "./components/BestsByMonth/MonthData.tsx";

const localCSVFiles = [
  "/concept2-season-2024.csv",
  "/concept2-season-2025.csv",
  "/concept2-season-2026.csv",
];

function App() {
  const dispatch = useDispatch();
  const ergDataState = useSelector((state: RootState) => state.ergData);

  const [files, setFiles] = useState<File[] | null>(null);
  const [years, setYears] = useState<string[]>([]);

  const [workDistanceSums, setWorkDistanceSums] = useState<WorkDistanceSumsIF>({
    rowErg: 0,
    bikeErg: 0,
    skiErg: 0,
  });

  const [unfilteredRowData, setUnfilteredRowData] = useState<
    ParsedCSVRowDataIF[]
  >([]);

  const [ergData, setErgData] = useState<ErgDataIF>({
    ergDataByYear: {} as ErgDataByYear,
    allTimeSums: {} as AllTimeSumsDataIF,
    years: [],
  });

  const [selectedMonth, setSelectedMonth] = useState<MonthDataIF | null>(null);

  /* On page load, load my test data (for demo purposes) */
  useEffect(() => {
    loadTestData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Update loadTestData to use fetchLocalCSVFile from service
  const loadTestData = async () => {
    const filePromises = _.map(localCSVFiles, (fileName) =>
      fetchLocalCSVFile(fileName),
    );
    const localFiles = await Promise.all(filePromises);
    parseCSVFiles(
      localFiles,
      dispatch,
      setErgData,
      setYears,
      setUnfilteredRowData,
      setWorkDistanceSums,
      (val: boolean) => dispatch(setIsDoneLoadingCSVData(val)),
    );
  };

  const handleCSVInput = (payload: File[] | null) => {
    setFiles(payload);
    dispatch(setIsDoneLoadingCSVData(false));
  };

  // Update handleFormSubmit to use new parseCSVFiles signature
  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (files) {
      parseCSVFiles(
        files,
        dispatch,
        setErgData,
        setYears,
        setUnfilteredRowData,
        setWorkDistanceSums,
        (val: boolean) => dispatch(setIsDoneLoadingCSVData(val)),
      );
    }
  };

  const handleSelectYear = (year: string | null) => {
    if (year) {
      dispatch(setViewingYear(year));
      // Set selectedMonth to January of the selected year if available
      if (ergData.ergDataByYear[year] && ergData.ergDataByYear[year]["0"]) {
        setSelectedMonth(ergData.ergDataByYear[year]["0"]);
      } else if (ergData.ergDataByYear[year]) {
        // Fallback: first available month in that year
        const months = Object.keys(ergData.ergDataByYear[year]).sort(
          (a, b) => Number(a) - Number(b),
        );
        if (months.length > 0) {
          setSelectedMonth(ergData.ergDataByYear[year][months[0]]);
        } else {
          setSelectedMonth(null);
        }
      } else {
        setSelectedMonth(null);
      }
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
            <Grid.Col span={8}>
              <MonthCards
                data={ergData.ergDataByYear}
                onMonthClick={setSelectedMonth}
                selectedMonth={selectedMonth}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <div>
                <MonthData monthData={selectedMonth} />
              </div>
            </Grid.Col>
          </Grid>
          {/** AG-grid table with workout details - removed 12/30, it's not very useful **/}
          {/** <WorkoutTableComponent unfilteredRowData={unfilteredRowData} /> **/}
        </div>
        <div className={"bottom-credits"}>
          App by <a href={"https://github.com/manderly"}>Mandi Burley</a>,
          2024-2026
        </div>
      </Container>
    </MantineProvider>
  );
}

export default App;
