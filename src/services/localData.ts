export const upcomingChallenges = {
  "data": [
    {
      "key": "april-fools",
      "name": "April Fools'",
      "season": 2024,
      "start": "2024-04-01",
      "end": "2024-04-15",
      "activity": "Row/Ski/Ride",
      "category": "Individual",
      "description": "Complete an increasing distance every day from April 1 to April 15.",
      "short_description": null,
      "link": "https://log.concept2.com/challenges/april-fools",
      "image": "https://media.concept2.com/assets/challenges/april-fools/2024/images/large/aprilfools-web-2024.png"
    }
  ]
}

export const rawColData = [
  { field: "ergType", flex: 1 },
  { field: "date", flex: 2 },
  { field: "time", flex: 2 },
  { field: "pace", flex: 2 },
  { field: "calories", flex: 2 },
  { field: "stroke", flex: 2 },
  { field: "best", flex: 2 },
];

export const rawRowData = [
  { date: "01-01-2024", ergType: "Row", time: '5:50', pace: '2:51/500m', calories: '45', stroke: '25 s/m', best: false },
  { date: "01-02-2024", ergType: "Bike", time: '25:00', pace: '2:25/1000m', calories: '110', stroke: '30 s/m', best: true},
  { date: "01-03-2024", ergType: "Row", time: '8:30', pace: '2:45/500m', calories: '65', stroke: '26 s/m', best: true },
];