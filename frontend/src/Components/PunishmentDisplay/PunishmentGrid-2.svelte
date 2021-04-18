<script lang="ts">
  import GroupStore from "../../stores/groups";
</script>

<div class="punishmentGrid">
  <!-- This example requires Tailwind CSS v2.0+ -->
  <div class="flex flex-col">
    <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
        <div
          class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
        >
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Navn
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Antall straffer
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Sist straffet
                </th>
              </tr>
            </thead>
            {#each $GroupStore.groups.filter((g) => g.name === $GroupStore.currentGroup)[0].users as user (user.id)}
              <tbody class="bg-white divide-y divide-gray-200">
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">WINE WINE WINE</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">29.07.20</div>
                  </td>
                </tr>

                <!-- More items... -->
              </tbody>
            {/each}
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="less">
  @import "../../variables.less";
  .punishmentGrid {
    display: grid;
    box-sizing: border-box;
    width: 600px;
    grid-template-columns: 3fr 3fr 3fr;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
  }
</style>
