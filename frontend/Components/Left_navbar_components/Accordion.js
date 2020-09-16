import React, { useState, useRef } from "react";

const Accordion = (props) => {
  const [setActive, setActiveState] = useState("");
  const [setHeight, setHeightState] = useState("0px");

  const content = useRef(null);

  const toggleAccordion = () => {
    setActiveState(setActive === "" ? "active" : "");
    setHeightState(
      setActive === "active" ? "0px" : `${content.current.scrollHeight}px`
    );
    console.log(content.current.scrollHeight);
    //changeStyle(setHeight);
  };

  const changeStyle = (setHeight) => {
    if (setHeight > 0) {
      document.getElementsByClassName("accordion").style.color.setState =
        "#0f2d5c";
      console.log("changed color");
    } else {
      document.getElementsByClassName("accordion").style.color.setState =
        "#153c79";
    }
  };

  return (
    <div className="accordion__section">
      <div className={`accordion ${setActive}`} onClick={toggleAccordion}>
        {props.title}
      </div>
      <div
        ref={content}
        style={{ maxHeight: `${setHeight}` }}
        className="accordion__content"
      >
        <div className="accordion__text">{props.content}</div>
      </div>
    </div>
  );
};

export default Accordion;
