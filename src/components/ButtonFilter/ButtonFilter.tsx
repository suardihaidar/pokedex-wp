import React, { useState } from "react";
import colors from "../../assets/colors";

type Props = {
  onClick: any;
  title: string;
  type?: string;
};

const ButtonFilter: React.FC<Props> = ({ onClick, title, type }): any => {
  const [hover, setHover] = useState(false);

  return (
    <button
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      onClick={onClick}
      className="w-full h-10 rounded mb-3 flex justify-center items-center"
      style={{
        backgroundColor: `${
          hover ? "#D1D5DB" : type === title ? colors[title] : "#F3F4F6"
        }`,
        color: `${type === title ? "white" : colors[title]}`,
      }}
    >
      <span className="text-sm font-medium uppercase">{title}</span>
    </button>
  );
};

export default ButtonFilter;
