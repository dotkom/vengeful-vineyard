<script lang="ts">
  import Accordion from "./Accordion.svelte";
  import AccordionContent from "./AccordionContent.svelte";
</script>

<div>
  <Accordion title="Filtre">
      <div class="accordion__content">
        <AccordionContent />
      </div>
  </Accordion>
  <Accordion title="Wall of Shame"/>
  <Accordion title="Enda flere options"/>
  <Accordion title="Flere?? options?? Pog"/>
</div>
