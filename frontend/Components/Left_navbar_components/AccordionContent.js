import React from "react";

const AccordionContent = () => {
  return (
    <div className="accordion__text">
      <label>
        Vis:
        <br />
        <label for="vis">
          <input
            type="radio"
            className="radioButton"
            id="naavaarende"
            name="vis"
            checked="checked"
          />
          Nåværende medlemmer
        </label>
        <br />
        <label for="vis">
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
          checked="checked"
        />
        <label for="vis">Flest straffer (verdi)</label>
        <br />
        <input type="radio" className="radioButton" id="minst" name="sort" />
        <label for="vis">Færrest straffer (verdi)</label>
      </label>
    </div>
  );
};

export default AccordionContent;
