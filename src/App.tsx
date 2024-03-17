import { useState, useEffect } from 'react'
import './App.css'
import { getUpcomingChallenges } from './services/api.ts';

type UpcomingChallenges = {
  data: object[];
}


function App() {
  const [upcomingChallenges, setUpcomingChallenges] = useState<UpcomingChallenges>({data: []});

  const getData = async () => {
    const foo = await getUpcomingChallenges(30);
    console.log(foo);
    setUpcomingChallenges(foo);
    // another call 1
    // another call 2
  }
  useEffect(() => {
    void getData();
  }, []);

  const displayUpcomingChallenges = () => (
    upcomingChallenges.data.map((item) =>
      <div key={item.key}>
        <h3>{item.key}</h3>
        <label>{item.description}</label>
      </div>)
  );

  return (
    <>
      <h1>C2 Erg Best</h1>
      <h2>Upcoming Challenges</h2>
      <div>
        {displayUpcomingChallenges()}
      </div>
    </>
  )
}

export default App
