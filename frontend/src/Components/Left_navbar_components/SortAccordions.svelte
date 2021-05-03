<script lang="ts">
  import Accordion from "./Accordion.svelte";
  import AccordionContent from "./AccordionContent.svelte";
</script>

<div>
  <Accordion title="Bytt gruppe" />
  <Accordion title="Sorter etter">
    <AccordionContent />
  </Accordion>
  <Accordion title="Mine straffer" />
  <Accordion title="Legg til straff" />
  <Accordion title="Legg til flere typer straffer" />
</div>
