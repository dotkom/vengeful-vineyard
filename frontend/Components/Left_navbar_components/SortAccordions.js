import React from "react";
import Accordion from "./Accordion";
import AccordionContent from "./AccordionContent";

const SortAccordions = () => {
  return (
    <div>
      <Accordion
        title="Filtre"
        content={
          <div className="accordion__content">
            <AccordionContent />
          </div>
        }
      />
      <Accordion title="Wall of Shame" content="" />
      <Accordion title="Enda flere options" content="" />
      <Accordion title="Flere?? options?? Pog" content="" />
    </div>
  );
};

export default SortAccordions;
