import SearchUser from "../../src/components/filters/SearchUser.svelte";
import { render, fireEvent } from "@testing-library/svelte";
import { users } from "../../public/assets/mocks/usersMock";

/**
 * @jest-environment jsdom
 */

describe("SearchUser", () => {
  it("changes textinput value on input", async () => {
    window.localStorage.setItem("users", JSON.stringify(users));

    const { getByRole } = render(SearchUser);

    const input = getByRole("textbox");
    fireEvent.change(input, { target: { value: "123" } });
    expect(input.value).toBe("123");
  });
});
