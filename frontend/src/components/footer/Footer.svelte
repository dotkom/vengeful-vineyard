<script lang="ts">
  import OnlineLogoFooter from "./OnlineLogoFooter.svelte";
  import FooterSign from "./FooterSign.svelte";
  import FooterGithub from "./FooterGithub.svelte";
</script>

<footer>
  <FooterSign />
  <FooterGithub />
  <OnlineLogoFooter />
</footer>

<style lang="less">
  @import "../../variables.less";
  footer {
    background: rgb(242, 242, 242);
    height: 220px;
    margin-top: 1em;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
