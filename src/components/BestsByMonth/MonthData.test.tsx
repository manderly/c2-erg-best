/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import MonthData from "./MonthData";
import { BestWorkoutInCategoryIF, MonthDataIF } from "../../types/types";

const bestWorkoutInCategory: BestWorkoutInCategoryIF = {
  value: 2500,
  date: 1768416000,
  workoutId: "999999",
};
const bestPace: BestWorkoutInCategoryIF = {
  value: 120,
  date: 1768416000,
  workoutId: "999998",
};
const emptyBest: BestWorkoutInCategoryIF = {
  value: 0,
  date: 0,
  workoutId: "",
};

const fullErgSummary = {
  sessionCount: 2,
  workDistanceSum: 5000,
  workTimeSum: 1200,
  bestDistance: bestWorkoutInCategory,
  bestPace: bestPace,
  bestStroke: bestWorkoutInCategory,
  bestWorkTime: bestWorkoutInCategory,
  bestWatts: bestWorkoutInCategory,
  bestCalories: bestWorkoutInCategory,
  bestDescription: "Test best",
  bestStartTime: "2026-01-01T10:00:00Z",
  bestStrokeCount: 100,
  bestTotalCal: 50,
  bestWattsAvg: bestWorkoutInCategory,
  restDistanceSum: 100,
  restTimeSum: 100,
};
const emptyErgSummary = {
  sessionCount: 0,
  workDistanceSum: 0,
  workTimeSum: 0,
  bestDistance: emptyBest,
  bestPace: emptyBest,
  bestStroke: emptyBest,
  bestWorkTime: emptyBest,
  bestWatts: emptyBest,
  bestCalories: emptyBest,
  bestDescription: "",
  bestStartTime: "",
  bestStrokeCount: 0,
  bestTotalCal: 0,
  bestWattsAvg: emptyBest,
  restDistanceSum: 0,
  restTimeSum: 0,
};

describe("MonthData", () => {
  it("renders placeholder when no monthData is provided", () => {
    render(
      <MantineProvider>
        <MonthData monthData={null} />
      </MantineProvider>,
    );
    expect(
      screen.getByText(/Select a month to view details/i),
    ).toBeInTheDocument();
  });

  it("renders month name and year", () => {
    const mockMonth: MonthDataIF = {
      name: "January",
      year: 2026,
      rowErg: fullErgSummary,
      bikeErg: fullErgSummary,
      skiErg: emptyErgSummary,
      rowErgSessionsByDayOfMonth: [],
      bikeErgSessionsByDayOfMonth: [],
      skiErgSessionsByDayOfMonth: [],
      metersAll: 17000,
    };
    render(
      <MantineProvider>
        <MonthData monthData={mockMonth} />
      </MantineProvider>,
    );
    expect(screen.getByText(/January 2026/)).toBeInTheDocument();
    // There may be multiple 'Total' elements, so check that at least one exists
    expect(screen.getAllByText(/Total/).length).toBeGreaterThan(0);
  });

  it("renders ErgData for rowErg and bikeErg only if sessionCount > 0", () => {
    const mockMonth: MonthDataIF = {
      name: "January",
      year: 2026,
      rowErg: fullErgSummary,
      bikeErg: fullErgSummary,
      skiErg: emptyErgSummary,
      rowErgSessionsByDayOfMonth: [],
      bikeErgSessionsByDayOfMonth: [],
      skiErgSessionsByDayOfMonth: [],
      metersAll: 17000,
    };
    render(
      <MantineProvider>
        <MonthData monthData={mockMonth} />
      </MantineProvider>,
    );
    expect(screen.getByText(/rowErg/i)).toBeInTheDocument();
    expect(screen.getByText(/bikeErg/i)).toBeInTheDocument();
    expect(screen.queryByText(/skiErg/i)).not.toBeInTheDocument();
  });
});
