import { useEffect, useState } from "react";
import {
  ParsedCSVRowDataIF,
  RowIF,
  WorkoutDataType,
} from "../../types/types.ts";
import { AgGridReact } from "ag-grid-react";
import { Checkbox, Chip, Flex, NativeSelect } from "@mantine/core";
import _ from "lodash";
import { DateInput } from "@mantine/dates";
import {
  ColDef,
  ColGroupDef,
  GridOptions,
  ICellRendererParams,
} from "ag-grid-community";
import { isAfter, isBefore, subDays } from "date-fns";
import { useForm } from "react-hook-form";
import { getFormattedDistanceString } from "../../services/formatting_utils.ts";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store.ts";

interface WorkoutTableComponentIF {
  unfilteredRowData: ParsedCSVRowDataIF[];
}

const ergTypeCellRenderer = (params: ICellRendererParams) => {
  return (
    <>{params.data.type.charAt(0).toUpperCase() + params.data.type.slice(1)}</>
  );
};

const distanceCellRenderer = (params: ICellRendererParams<RowIF>) => {
  return getFormattedDistanceString(params["valueFormatted"] ?? undefined);
};

const numberCellRenderer = (params: ICellRendererParams<RowIF>) => {
  const value = Number(params["value"]);
  if (value > 0) {
    return <>{value.toLocaleString()}</>;
  } else {
    return <>--</>;
  }
};

const ALL_COLUMNS = [
  { field: "date", flex: 3.2 },
  { field: "startTime", flex: 2.5 },
  { field: "type", flex: 2, cellRenderer: ergTypeCellRenderer },
  { field: "description", flex: 3 },
  { field: "pace", flex: 3 },
  {
    headerName: "Workout Time",
    children: [
      {
        field: "workTime",
        flex: 2.5,
        headerName: "Work",
        type: "rightAligned",
      },
      {
        field: "restTime",
        flex: 2.5,
        headerName: "Rest",
        type: "rightAligned",
      },
    ],
  },
  {
    headerName: "Distance",
    children: [
      {
        field: "workDistance",
        flex: 2.5,
        headerName: "Work",
        type: "rightAligned",
        cellRenderer: distanceCellRenderer,
      },
      {
        field: "restDistance",
        flex: 2.5,
        headerName: "Rest",
        type: "rightAligned",
        cellRenderer: distanceCellRenderer,
      },
    ],
  },
  {
    headerName: "Stroke",
    children: [
      {
        field: "strokeRate",
        flex: 1.5,
        headerName: "Rate",
        type: "rightAligned",
      },
      {
        field: "strokeCount",
        flex: 1.5,
        headerName: "Count",
        type: "rightAligned",
        cellRenderer: numberCellRenderer,
      },
    ],
  },
  { field: "totalCal", flex: 1 },
  { headerName: "♥", field: "avgHeartRate", flex: 1 },
  { field: "dragFactor", flex: 1 },
  { field: "ranked", flex: 1 },
];

export const WorkoutTableComponent: React.FC<WorkoutTableComponentIF> = ({
  unfilteredRowData,
}) => {
  const DATE_FORMAT = "MMM D, YYYY";
  const gridOptions: GridOptions = {
    getRowStyle: getRowStyleErgType,
  };

  const ergDataState = useSelector((state: RootState) => state.ergData);

  function getRowStyleErgType(item: WorkoutDataType) {
    if (item.data.type === "rowErg") {
      return {
        backgroundColor: "#6E751F",
        color: "#F4F8F5",
      };
    } else if (item.data.type === "bikeErg") {
      return {
        backgroundColor: "#003A70",
        color: "#F4F8F5",
      };
    } else {
      // ski erg
      return {
        backgroundColor: "#7e6b73",
        color: "#F4F8F5",
      };
    }
  }

  const getFilteredRows = () => {
    const copy = _.cloneDeep(unfilteredRowData);
    if (copy && copy.length) {
      return copy.filter((row: ParsedCSVRowDataIF) => {
        if (!includeBike && row.type === "bikeErg") {
          return;
        }
        if (!includeRower && row.type === "rowErg") {
          return;
        }
        if (!includeSki && row.type === "skiErg") {
          return;
        }

        // ignore any row that is outside the date range
        if (
          isBefore(new Date(row.date), new Date(startDate)) ||
          isAfter(new Date(row.date), new Date(endDate))
        ) {
          return;
        }

        return row;
      });
    } else {
      return [];
    }
  };

  const getFilteredColumns = () => {
    return ALL_COLUMNS.filter((col: ColDef) => {
      if (col.field === "startTime" && includeStartTime) {
        return col;
      } else if (col.field === "startTime" && !includeStartTime) {
        return;
      }

      if (col.field === "totalCal" && includeTotalCal) {
        return col;
      } else if (col.field === "totalCal" && !includeTotalCal) {
        return;
      }

      if (col.field === "ranked" && includeRanked) {
        return col;
      } else if (col.field === "ranked" && !includeRanked) {
        return;
      }

      if (col.field === "dragFactor" && includeDragFactor) {
        return col;
      } else if (col.field === "dragFactor" && !includeDragFactor) {
        return;
      }

      return col;
    });
  };

  const { handleSubmit } = useForm();

  const [startDate, setStartDate] = useState(subDays(new Date(), 120));
  const [endDate, setEndDate] = useState(new Date());

  const [minimumDuration, setMinimumDuration] = useState("60");

  const [includeRower, setIncludeRower] = useState(true);
  const [includeBike, setIncludeBike] = useState(true);
  const [includeSki, setIncludeSki] = useState(true);
  const [includeStartTime, setIncludeStartTime] = useState(false);
  const [includeTotalCal, setIncludeTotalCal] = useState(false);
  const [includeRanked, setIncludeRanked] = useState(false);
  const [includeDragFactor, setIncludeDragFactor] = useState(false);

  const [colDefs, setColDefs] =
    useState<(ColDef | ColGroupDef)[]>(getFilteredColumns());

  const [filteredRowData, setFilteredRowData] = useState<ParsedCSVRowDataIF[]>(
    [],
  );

  useEffect(() => {
    setColDefs(getFilteredColumns());
  }, [includeStartTime, includeTotalCal, includeRanked, includeDragFactor]);

  useEffect(() => {
    setFilteredRowData(getFilteredRows());
  }, [unfilteredRowData, includeBike, includeRower, startDate, endDate]);

  const SearchFilters = () => (
    <>
      <h2 className={"main-page-title"}>Filter data</h2>
      <Flex
        mih={50}
        gap="md"
        justify="flex-start"
        align="flex-start"
        direction="row"
        wrap="wrap"
      >
        <Chip
          checked={includeRower && ergDataState.hasRowErg}
          disabled={!ergDataState.hasRowErg}
          onChange={() => setIncludeRower((v) => !v)}
        >
          RowErg
        </Chip>

        <Chip
          checked={includeBike && ergDataState.hasBikeErg}
          disabled={!ergDataState.hasBikeErg}
          onChange={() => setIncludeBike((v) => !v)}
        >
          BikeErg
        </Chip>

        <Chip
          checked={includeSki && ergDataState.hasSkiErg}
          disabled={!ergDataState.hasSkiErg}
          onChange={() => setIncludeSki((v) => !v)}
        >
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
        <form onSubmit={handleSubmit(_.noop)}>
          <DateInput
            value={startDate}
            onChange={() => setStartDate}
            label={"Start"}
            valueFormat={DATE_FORMAT}
          />
          <DateInput
            value={endDate}
            onChange={() => setEndDate}
            label={"End"}
            valueFormat={DATE_FORMAT}
          />

          <NativeSelect
            label={"Exclude workouts shorter than..."}
            value={minimumDuration}
            onChange={(event) => setMinimumDuration(event.currentTarget.value)}
            data={[
              { label: "30 seconds", value: "30" },
              { label: "1 minute", value: "60" },
              { label: "5 minutes", value: "300" },
              { label: "10 minutes", value: "600" },
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
        <Checkbox
          checked={includeStartTime}
          label={"Include start time"}
          onChange={() => setIncludeStartTime((prev) => !prev)}
        />
        <Checkbox
          checked={includeTotalCal}
          label={"Include calories"}
          onChange={() => setIncludeTotalCal((prev) => !prev)}
        />
        <Checkbox
          checked={includeRanked}
          label={"Include ranked"}
          onChange={() => setIncludeRanked((prev) => !prev)}
        />
        <Checkbox
          checked={includeDragFactor}
          label={"Include drag factor"}
          onChange={() => setIncludeDragFactor((prev) => !prev)}
        />
      </Flex>
    </>
  );

  return (
    <>
      <SearchFilters />
      <h2 className={"main-page-title"}>Logbook</h2>
      {filteredRowData && (
        <>
          Showing {filteredRowData.length} of this season's{" "}
          {unfilteredRowData.length} workouts
        </>
      )}
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
};
