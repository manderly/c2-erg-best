import {Card} from "@mantine/core";

interface MonthCardsIF {
  bests: object,
}
export const MonthCards: React.FC<MonthCardsIF> = ({bests }) => {
  for (const month in bests) {
    return <Card className={"previous-month"}>
      <h3>{month['name']}</h3>
      <a>View workout</a>
      <ul>
        <li>Pace: 0</li>
        <li>Distance: {month['distance']}</li>
        <li>Calories: 100</li>
        <li>Strokes: 10 s/m</li>
        <li>Details</li>
      </ul>
    </Card>
  }
};