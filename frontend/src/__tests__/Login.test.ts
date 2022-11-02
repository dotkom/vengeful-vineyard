import { render } from '@testing-library/svelte'
import Login from '../components/Login.svelte'

test('should render', () => {
  const results = render(Login)
  expect(() => results.getByText('Velkommen til')).toBeTruthy()
})
