import React from "react";
import { Tooltip } from "@mantine/core";

interface ViewWorkoutLinkIF {
  id: string;
}

const ViewWorkoutLink: React.FC<ViewWorkoutLinkIF> = ({ id }) => {
  return (
    <Tooltip label="View workout [Coming soon]">
      <div className="pull-right">
        <a className={"view-workout-link"} href={id}>
          ...
        </a>
      </div>
    </Tooltip>
  );
};

export default ViewWorkoutLink;
