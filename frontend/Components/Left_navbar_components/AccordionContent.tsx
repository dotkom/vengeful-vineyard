import React from "react";

const AccordionContent = () => {
  return (
    <div className="accordion__text">
      <label>
        Vis:
        <br />
        <label htmlFor="vis">
          <input
            type="radio"
            className="radioButton"
            id="naavaarende"
            name="vis"
            defaultChecked={true}
          />
          Nåværende medlemmer
        </label>
        <br />
        <label htmlFor="vis">
          <input
            type="radio"
            className="radioButton"
            id="naavaarende"
            name="vis"
          />
          All time
        </label>
      </label>
      <br />
      <br />
      <label>
        Sorter etter:
        <br />
        <input
          type="radio"
          className="radioButton"
          id="flest"
          name="sort"
          defaultChecked={true}
        />
        <label htmlFor="vis">Flest straffer (verdi)</label>
        <br />
        <input type="radio" className="radioButton" id="minst" name="sort" />
        <label htmlFor="vis">Færrest straffer (verdi)</label>
      </label>
    </div>
  );
};

export default AccordionContent;
