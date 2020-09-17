import React, { useState, useRef } from "react";

type Props = {
  title: string;
  content: any;
}

const Accordion = (props : Props) => {
  const [setActive, setActiveState] = useState("");
  const [setHeight, setHeightState] = useState("0px");

  const content = useRef<HTMLDivElement>(null);

  const toggleAccordion = () => {
    setActiveState(setActive === "" ? "active" : "");
    if (null === content.current) {
      return;
    }
    setHeightState(
      setActive === "active" ? "0px" : `${content.current.scrollHeight}px`
    );
    console.log(content.current.scrollHeight);
    //changeStyle(setHeight);
  };

  const changeStyle = (setHeight : number) => {
    const accordion = document.querySelector<HTMLElement>('.accordion');
    if (null === accordion) {
      console.log("Could not find accordion");
      return;
    }
    if (setHeight > 0) {
      accordion.style.color = "#0f2d5c";
      console.log("changed color");
    } else {
      accordion.style.color = "#153c79";
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
