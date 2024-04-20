import {useState, useEffect, useMemo} from 'react'
import './App.css'
import '@mantine/core/styles.css';
import {Checkbox, Divider, FileInput, MantineProvider, NativeSelect} from '@mantine/core';
import { Grid, Chip, Button, Flex } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {isAfter, isBefore, subDays} from 'date-fns';
import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid
import { useForm } from 'react-hook-form';
import Papa from 'papaparse';
import {ColDef, GridOptions, ICellRendererParams} from "ag-grid-community";
import _ from 'lodash';
import {
  getFormattedDate,
  getFormattedDistance, getFormattedDistanceString,
  getFormattedDuration,
  getFormattedTime,
  getMonthNumber, getRowYear, parseTimeToMilliseconds
} from "./services/formatting_utils";
import {UpcomingChallenges} from "./components/UpcomingChallenges";
import {MonthCards} from "./components/MonthCards";
import {BestDataIF, RowIF, WorkoutDataType, DisplayRowType} from "./types/types.ts";

const csvFile = '/concept2-season-2024.csv';

const ergTypeCellRenderer = (params: ICellRendererParams) => {
  return <>{params.data.type.charAt(0).toUpperCase() + params.data.type.slice(1)}</>;
}

const distanceCellRenderer = (params: ICellRendererParams<RowIF>) => {
  return getFormattedDistanceString(params['valueFormatted']);
}

const numberCellRenderer = (params: ICellRendererParams<RowIF>) => {
  const value = Number(params['value']);
  if (value > 0) {
    return <>{value.toLocaleString()}</>
  } else {
    return <>--</>
  }
}

const ALL_COLUMNS = [
  {field: 'date', flex: 3.2},
  {field: 'startTime', flex: 2.5},
  {field: 'type', flex: 2, cellRenderer: ergTypeCellRenderer},
  {field: 'description', flex: 3},
  {field: 'pace', flex: 3},
  {
    headerName: "Workout Time",
    children: [
      {
        field: 'workTime',
        flex: 2.5,
        headerName: 'Work',
        type: 'rightAligned'
      },
      {
        field: 'restTime',
        flex: 2.5,
        headerName: 'Rest',
        type: 'rightAligned',
      },
    ],
  },
  {
    headerName: 'Distance',
    children: [
      {
        field: 'workDistance',
        flex: 2.5,
        headerName: 'Work',
        type: 'rightAligned',
        cellRenderer: distanceCellRenderer
      },
      {
        field: 'restDistance',
        flex: 2.5,
        headerName: 'Rest',
        type: 'rightAligned',
        cellRenderer: distanceCellRenderer
      },
    ]
  },
  {
    headerName: 'Stroke',
    children: [
      {
        field: 'strokeRate',
        flex: 1.5,
        headerName: 'Rate',
        type: 'rightAligned',
      },
      {
        field: 'strokeCount',
        flex: 1.5,
        headerName: 'Count',
        type: 'rightAligned',
        cellRenderer: numberCellRenderer
      },
    ]
  },
  {field: 'totalCal', flex: 1},
  {headerName: '♥', field: 'avgHeartRate', flex: 1},
  {field: 'dragFactor', flex: 1},
  {field: 'ranked', flex: 1},
];

const DEFAULT_RECORD_DATA: BestDataIF = {
  bestDistance: {
    value: 0,
    date: '',
    workoutId: '',
  },
  bestPace: {
    value: '00:00.0',
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
  const DATE_FORMAT = "MMM D, YYYY";
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;

  const getFilteredRows = () => {
    const copy = _.cloneDeep(unfilteredRowData);
    if (copy && copy.length) {
      return copy.filter((row: DisplayRowType) => {
        // ignore any row that isn't a selected type
        if (!includeBike && row.type === 'BikeErg') {
          return;
        }
        if (!includeRower && row.type === 'RowErg') {
          return;
        }
        if (!includeSki && row.type === 'SkiErg') {
          return;
        }

        // ignore any row that is outside the date range
        if (isBefore(new Date(row.date), new Date(startDate)) || isAfter(new Date(row.date), new Date(endDate))) {
          return;
        }

        return row;
      })
    }
  }

  const getFilteredColumns = () => {
    return ALL_COLUMNS.filter((col: ColDef ) => {
      if (col.field === 'startTime' && includeStartTime) {
        return col;
      } else if (col.field === 'startTime' && !includeStartTime) {
        return;
      }

      if (col.field === 'totalCal' && includeTotalCal) {
        return col;
      } else if (col.field === 'totalCal' && !includeTotalCal) {
        return;
      }

      if (col.field === 'ranked' && includeRanked) {
        return col;
      } else if (col.field === 'ranked' && !includeRanked) {
        return;
      }

      if (col.field === 'dragFactor' && includeDragFactor) {
        return col;
      } else if (col.field === 'dragFactor' && !includeDragFactor) {
        return;
      }

      return col;
    })
  }

  const { register, handleSubmit } = useForm();
  const onSubmitFiltersForm = data => console.log(data);
  const [file, setFile] = useState();

  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [minimumDuration, setMinimumDuration] = useState('60');

  const [hasRowErg, setHasRowErg] = useState(false);
  const [hasBikeErg, setHasBikeErg] = useState(false);
  const [hasSkiErg, setHasSkiErg] = useState(false);

  const [includeRower, setIncludeRower] = useState(true);
  const [includeBike, setIncludeBike] = useState(true);
  const [includeSki, setIncludeSki] = useState(true);
  const [includeStartTime, setIncludeStartTime] = useState(false);
  const [includeTotalCal, setIncludeTotalCal] = useState(false);
  const [includeRanked, setIncludeRanked] = useState(false);
  const [includeDragFactor, setIncludeDragFactor] = useState(false);

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, setColDefs] = useState<ColDef[]>(getFilteredColumns());
  const [unfilteredRowData, setUnfilteredRowData] = useState([]);
  const [filteredRowData, setFilteredRowData] = useState([]);
  const [bests, setBests] = useState([]);

  const getData = async () => {
    await parseCSVIntoChartData(await fetchLocalCSVFile())
  }

  useEffect(() => {
    void getData();
  }, []);

  useEffect(() => {
    setColDefs(getFilteredColumns());
  }, [includeStartTime, includeTotalCal, includeRanked, includeDragFactor])

  useEffect(() => {
    setFilteredRowData(getFilteredRows());
  }, [unfilteredRowData, includeBike, includeRower, startDate, endDate])

  const fetchLocalCSVFile = async () => {
    try {
      const response = await fetch(csvFile);
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder('utf-8');
      const csv = await decoder.decode(result.value);
      //console.log('csv', csv);
      return csv;
    } catch(e) {
      console.log(e);
    }
  }

  const handleCSVInput = (event: never) => {
    setFile(event);
  }

  type ErgType = 'rowErg' | 'skiErg' | 'bikeErg';

  const updateUsersErgEquipmentTypes = (ergType: string) => {
    if (!hasRowErg && ergType === 'rowErg') {
      setHasRowErg(true);
    }

    if (!hasBikeErg && ergType === 'bikeErg') {
      setHasBikeErg(true);
    }

    if (!hasSkiErg && ergType === 'skiErg') {
      setHasSkiErg(true);
    }
  }

  const parseCSVIntoChartData = (csvFile: unknown) => {
    Papa.parse(csvFile, {
      complete: function(results: unknown) {
        results.data.shift();
        const localBests = {};
        // get all the row data line by line from the csv
        const allRowData = _.chain(results.data)
          .filter((row: (string|number)[]) => row.length > 1)
          .orderBy((row: (string|number)[]) => row[1]) // date
          .map((row: (string|number)[]) => {
            const ergType = String(row[19]).charAt(0).toLowerCase() + String(row[19]).slice(1);
            updateUsersErgEquipmentTypes(ergType);

            // rowData from the CSV
            const parsedCSVRowData = {
              dateRaw: String(row[1]),
              date: getFormattedDate(String(row[1])),
              startTime: getFormattedTime(String(row[1])),
              type: ergType as ErgType,
              description: String(row[2]),
              pace: String(row[11]), // example: 2:37.4
              workTime: getFormattedDuration(Number(row[4])),
              restTime: getFormattedDuration(Number(row[6])),
              workDistance: getFormattedDistance(row[7]),
              restDistance: getFormattedDistance(row[8]),
              strokeRate: Number(row[9]),
              strokeCount: Number(row[10]),
              totalCal: `${row[14]} (${row[13]} cal/hr)`,
              avgHeartRate: Number(row[15]),
              dragFactor: Number(row[16]),
              ranked: Boolean(row[20]),
              id: String(row[0]),
            }

            // check it against known bests
            const monthIdx = getMonthNumber(parsedCSVRowData.date)-1;
            const monthName = MONTH_NAMES[monthIdx];
            if (localBests[monthName] === undefined) {
              localBests[monthName] = {
                name: monthName,
                year: getRowYear(parsedCSVRowData.date),
                rowErg: _.cloneDeep(DEFAULT_RECORD_DATA),
                bikeErg: _.cloneDeep(DEFAULT_RECORD_DATA),
                skiErg: _.cloneDeep(DEFAULT_RECORD_DATA),
              };
            }

            // Update best distance, if better
            if (parsedCSVRowData.workDistance > Number(localBests[monthName][ergType].bestDistance.value)) {
              localBests[monthName][ergType].bestDistance.value = parsedCSVRowData.workDistance;
              localBests[monthName][ergType].bestDistance.date = parsedCSVRowData.date;
              localBests[monthName][ergType].bestDistance.workoutId = parsedCSVRowData.id;
            }

            // Update best pace, if better
            if (parseTimeToMilliseconds(parsedCSVRowData.pace) > parseTimeToMilliseconds(String(localBests[monthName][ergType].bestPace.value))) {
              localBests[monthName][ergType].bestPace.value = parsedCSVRowData.pace;
              localBests[monthName][ergType].bestPace.date = parsedCSVRowData.date;
              localBests[monthName][ergType].bestPace.workoutId = parsedCSVRowData.id;
            }

            // Update best strokeRate, if better
            if (parsedCSVRowData.strokeRate > Number(localBests[monthName][ergType].bestStroke.value)) {
              localBests[monthName][ergType].bestStroke.value = parsedCSVRowData.strokeRate;
              localBests[monthName][ergType].bestStroke.date = parsedCSVRowData.date;
              localBests[monthName][ergType].bestStroke.workoutId = parsedCSVRowData.id;
            }


            return parsedCSVRowData;
        }).value();

        setBests(localBests)
        setUnfilteredRowData(allRowData);
      }
    });
  }

  const UploadFile = () => (
    <form onSubmit={parseCSVIntoChartData}>
      <Flex
        className={"upload-file pad-bottom"}
        mih={100}
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

  const SearchFilters = () => (
    <>
    <h2 className={'main-page-title'}>Filter data</h2>
      <Flex
        mih={50}
        gap="md"
        justify="flex-start"
        align="flex-start"
        direction="row"
        wrap="wrap"
      >
        <Chip
          checked={includeRower && hasRowErg}
          disabled={!hasRowErg}
          onChange={() => setIncludeRower((v) => !v)}>
          RowErg
        </Chip>

        <Chip checked={includeBike && hasBikeErg} disabled={!hasBikeErg} onChange={() => setIncludeBike(v => !v)}>
            BikeErg
        </Chip>

        <Chip checked={includeSki && hasSkiErg} disabled={!hasSkiErg} onChange={() => setIncludeSki(v => !v)}>
            SkiErg
        </Chip>
      </Flex>

      <Flex
        mih={50}
        gap="md"
        justify="flex-start"
        align="flex-start"
        wrap="wrap"
        className={"filter-data"}
      >
        <form onSubmit={handleSubmit(onSubmitFiltersForm)}>
          <DateInput value={startDate} onChange={() => setStartDate} label={"Start"} valueFormat={DATE_FORMAT}/>
          <DateInput value={endDate} onChange={() => setEndDate} label={"End"} valueFormat={DATE_FORMAT}/>

          <NativeSelect
            label={"Exclude workouts shorter than..."}
            value={minimumDuration}
            onChange={(event) => setMinimumDuration(event.currentTarget.value)}
            data={[
              { label: '30 seconds', value: '30' },
              { label: '1 minute', value: '60' },
              { label: '5 minutes', value: '300' },
              { label: '10 minutes', value: '600' },
            ]}
          />
        </form>
      </Flex>

      <Flex
        mih={50}
        gap="md"
        justify="flex-start"
        align="flex-start"
        wrap="wrap"
        className={"filter-data"}
      >
        <Checkbox checked={includeStartTime} label={"Include start time"} onChange={() => setIncludeStartTime(prev => !prev)}/>
        <Checkbox checked={includeTotalCal} label={"Include calories"} onChange={() => setIncludeTotalCal(prev => !prev)}/>
        <Checkbox checked={includeRanked} label={"Include ranked"} onChange={() => setIncludeRanked(prev => !prev)}/>
        <Checkbox checked={includeDragFactor} label={"Include drag factor"} onChange={() => setIncludeDragFactor(prev => !prev)}/>
      </Flex>
    </>
  );

  const gridOptions: GridOptions = {
    getRowStyle: getRowStyleErgType
  }

  function getRowStyleErgType(item: WorkoutDataType) {
    if (item.data.type === 'rowErg') {
      return {
        'backgroundColor': '#afbd22', //'#455A64',
        'color': '#F4F8F5'
      }
    } else if (item.data.type === 'bikeErg') {
      return {
        'backgroundColor': '#003A70', //'#4CAF50',
        'color': '#F4F8F5'
      };
    }
    return null;
  }

  const ResultsTable = () => (
    <>
      <div
        className="ag-theme-quartz" // applying the grid theme
        style={{ height: 600 }} // expand grid to fit parent container
      >
        <AgGridReact
          rowData={filteredRowData}
          columnDefs={colDefs}
          gridOptions={gridOptions}
        />
      </div>
    </>
  );

  return (
    <MantineProvider defaultColorScheme="dark">
      <div className={"app-container"}>
      <h2>C2 Erg Best</h2>
        <Grid className={"pad-left"}>
          <Grid.Col span={12}>
            <UploadFile />
            <Divider/>
            <SearchFilters />
            {filteredRowData &&
                <>
                    Showing {filteredRowData.length} of this season's {unfilteredRowData.length} workouts
                </>
            }
            <ResultsTable/>

            <h2 className={'main-page-title'}>Bests</h2>

            <Flex
              mih={50}
              gap="md"
              justify="flex-start"
              align="flex-start"
              direction="row"
              wrap="wrap"
            >
            <MonthCards bests={bests} hasRowErg={hasRowErg} hasBikeErg={hasBikeErg} hasSKiErg={hasSkiErg}/>
            </Flex>

          </Grid.Col>
          <Grid.Col span={12} className={'grid-challenges'}><div>
            <UpcomingChallenges />
          </div>
          </Grid.Col>
        </Grid>
      </div>

    </MantineProvider>
  )
}

export default App
