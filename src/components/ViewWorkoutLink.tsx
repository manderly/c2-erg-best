import React from 'react';

interface ViewWorkoutLinkIF {
  id: string;
}

const ViewWorkoutLink: React.FC<ViewWorkoutLinkIF> = ({ id }) => {
  return (
    <div className='pull-right'>
      <a className={'view-workout-link'} href={id}>...</a>
    </div>
  );
};

export default ViewWorkoutLink;
